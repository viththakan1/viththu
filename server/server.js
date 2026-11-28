import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
import { connectDB } from './config/db.js';
import { generateSitemapXml, generateRobotsTxt, renderSSRHtml } from './utils/seoRenderer.js';

import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Brand } from './models/Brand.js';
import { Banner } from './models/Banner.js';
import { Setting } from './models/Setting.js';
import { Vendor } from './models/Vendor.js';
import { Dropshipper } from './models/Dropshipper.js';
import { Review } from './models/Review.js';
import { Order } from './models/Order.js';
import { Message } from './models/Message.js';

import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import brandsRouter from './routes/brands.js';
import ordersRouter from './routes/orders.js';
import bannersRouter from './routes/banners.js';
import messagesRouter from './routes/messages.js';
import settingsRouter from './routes/settings.js';
import vendorsRouter from './routes/vendors.js';
import dropshippersRouter from './routes/dropshippers.js';
import reviewsRouter from './routes/reviews.js';
import customersRouter from './routes/customers.js';
import adminRouter, { ensureAdminExists } from './routes/admin.js';
import courierRouter from './routes/courier.js';
import imageProxyRouter from './routes/imageProxy.js';
import { backfillProductSlugs } from './utils/backfillSlugs.js';
import { optionalAuth } from './utils/auth.js';
import { sanitizeInputs } from './utils/sanitize.js';
import { apiLimiter } from './utils/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');

// Connect to MongoDB Atlas and trigger background slug migration
connectDB().then(() => {
  ensureAdminExists().catch(() => {});
  backfillProductSlugs().catch((err) => console.warn('Backfill slugs notice:', err.message));
});

// Strict CORS Allowlist
const ALLOWED_ORIGINS = [
  'https://haveitall.lk',
  'https://www.haveitall.lk',
  'https://fdedomestic.com',
  'https://www.fdedomestic.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isExplicitAllowed = ALLOWED_ORIGINS.includes(origin);
    const isVercelPreview = origin.endsWith('.vercel.app');
    const isDevLocal = process.env.NODE_ENV !== 'production' && (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    );

    if (isExplicitAllowed || isVercelPreview || isDevLocal) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-access-token']
};

app.use(cors(corsOptions));

// HTTP Security Headers middleware (A/A+ on SecurityHeaders.com)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  next();
});

// Turn off verbose debug logging in production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sanitize all inputs against NoSQL injection & XSS
app.use(sanitizeInputs);

// Apply rate limiting on API endpoints
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HAVEITALL Backend API is connected and running',
    timestamp: new Date().toISOString()
  });
});

// Single-roundtrip Bootstrap endpoint (Sanitized public catalog data; sensitive orders/messages/vendor PII restricted to admin)
app.get('/api/bootstrap', optionalAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    const isAdmin = req.user && ['admin', 'superadmin'].includes(String(req.user.role).toLowerCase());

    const [products, categories, brands, banners, settings, reviews] = await Promise.all([
      Product.find().lean().catch(() => []),
      Category.find().lean().catch(() => []),
      Brand.find().lean().catch(() => []),
      Banner.find().lean().catch(() => []),
      Setting.findOne().lean().catch(() => null),
      Review.find().lean().catch(() => [])
    ]);

    let vendors = [];
    let dropshippers = [];
    let orders = [];
    let messages = [];

    // PRIVACY & SECURITY GUARD: Only authenticated administrators can access customer orders, messages, vendors, and dropshippers
    if (isAdmin) {
      [vendors, dropshippers, orders, messages] = await Promise.all([
        Vendor.find().select('-password').lean().catch(() => []),
        Dropshipper.find().select('-password').lean().catch(() => []),
        Order.find().sort({ createdAt: -1, _id: -1 }).lean().catch(() => []),
        Message.find().sort({ createdAt: -1, _id: -1 }).lean().catch(() => [])
      ]);
    }

    res.json({
      products: products || [],
      categories: categories || [],
      brands: brands || [],
      banners: banners || [],
      settings: settings || null,
      reviews: reviews || [],
      vendors,
      dropshippers,
      orders,
      messages
    });
  } catch (err) {
    console.error('Bootstrap error:', err.message);
    res.status(500).json({ error: 'Failed to load initial data' });
  }
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/dropshippers', dropshippersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/admin', adminRouter);
app.use(['/api/courier', '/courier', '/api/fardar', '/fardar'], courierRouter);
app.use(['/api/image-proxy', '/image-proxy'], imageProxyRouter);

// Robots.txt
app.get(['/robots.txt', '/api/robots.txt'], (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  res.send(generateRobotsTxt());
});

// Dynamic Sitemap.xml (Prevent indexing sitemap.xml itself via X-Robots-Tag: noindex, follow)
app.get(['/sitemap.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml'], async (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, follow');
  try {
    const [products, brands, categories] = await Promise.all([
      Product.find({ isDeleted: { $ne: true }, status: { $ne: 'inactive' } }).lean().catch(() => []),
      Brand.find({ isDeleted: { $ne: true } }).lean().catch(() => []),
      Category.find({ isDeleted: { $ne: true } }).lean().catch(() => []),
    ]);
    const xml = generateSitemapXml(products, brands, categories);
    return res.status(200).send(xml);
  } catch (err) {
    const xml = generateSitemapXml();
    return res.status(200).send(xml);
  }
});

// Serve frontend production build if available
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('{*splat}', async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  const indexPath = fs.existsSync(path.join(distPath, 'index.html'))
    ? path.join(distPath, 'index.html')
    : path.join(__dirname, '../index.html');

  if (fs.existsSync(indexPath)) {
    try {
      const baseHtml = fs.readFileSync(indexPath, 'utf-8');
      const [products, brands, categories] = await Promise.all([
        Product.find().lean().catch(() => []),
        Brand.find().lean().catch(() => []),
        Category.find().lean().catch(() => []),
      ]);
      const result = renderSSRHtml(req.path, baseHtml, { products, brands, categories });

      if (result.redirect) {
        return res.redirect(result.status || 301, result.redirect);
      }

      return res.status(result.status || 200).send(result.html);
    } catch (err) {
      console.error('SSR render error:', err);
      return res.sendFile(indexPath);
    }
  }

  next();
});

// Global Error Handler (Hides internal stack traces & error messages in production)
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  if (err.message && err.message.startsWith('CORS policy blocked')) {
    return res.status(403).json({ error: 'Access forbidden by CORS policy' });
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProd ? 'An internal server error occurred. Please try again later.' : (err.message || 'Internal Server Error')
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 HAVEITALL Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another running instance.`);
    console.error(`👉 Close the process currently using port ${PORT} or change PORT in server/.env`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

export default app;
