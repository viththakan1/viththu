import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { connectDB } from '../server/config/db.js';
import { generateSitemapXml, generateRobotsTxt, renderSSRHtml } from '../server/utils/seoRenderer.js';

import { Product } from '../server/models/Product.js';
import { Category } from '../server/models/Category.js';
import { Brand } from '../server/models/Brand.js';
import { Banner } from '../server/models/Banner.js';
import { Setting } from '../server/models/Setting.js';
import { Vendor } from '../server/models/Vendor.js';
import { Dropshipper } from '../server/models/Dropshipper.js';
import { Review } from '../server/models/Review.js';
import { Order } from '../server/models/Order.js';
import { Message } from '../server/models/Message.js';

import productsRouter from '../server/routes/products.js';
import categoriesRouter from '../server/routes/categories.js';
import brandsRouter from '../server/routes/brands.js';
import ordersRouter from '../server/routes/orders.js';
import bannersRouter from '../server/routes/banners.js';
import messagesRouter from '../server/routes/messages.js';
import settingsRouter from '../server/routes/settings.js';
import vendorsRouter from '../server/routes/vendors.js';
import dropshippersRouter from '../server/routes/dropshippers.js';
import reviewsRouter from '../server/routes/reviews.js';
import customersRouter from '../server/routes/customers.js';
import adminRouter from '../server/routes/admin.js';
import courierRouter from '../server/routes/courier.js';
import imageProxyRouter from '../server/routes/imageProxy.js';
import { backfillProductSlugs } from '../server/utils/backfillSlugs.js';
import { optionalAuth } from '../server/utils/auth.js';
import { sanitizeInputs } from '../server/utils/sanitize.js';
import { apiLimiter } from '../server/utils/rateLimiter.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sanitize all inputs against NoSQL injection & XSS
app.use(sanitizeInputs);

// Apply rate limiting on API endpoints
app.use('/api', apiLimiter);

// Ensure MongoDB Atlas is connected on each incoming serverless invocation
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in serverless handler:', err);
  }
  next();
});

// Health Check - test DB connection and report status
app.get(['/api/health', '/health'], async (req, res) => {
  let dbStatus = 'disconnected';
  let host = 'cluster0.4lmng0q.mongodb.net';
  let db = 'haveitall_store';
  try {
    const conn = await connectDB();
    const readyState = conn?.connection?.readyState ?? mongoose.connection?.readyState;
    if (readyState >= 1) {
      dbStatus = 'connected';
      host = conn?.connection?.host || mongoose.connection?.host || host;
      db = conn?.connection?.name || mongoose.connection?.name || db;
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    dbHost: host,
    dbName: db,
    message: 'HAVEITALL Backend API is connected and running on Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

// Single-roundtrip Bootstrap endpoint (Sanitized public catalog data; sensitive orders/messages/vendor PII restricted to admin)
app.get(['/api/bootstrap', '/bootstrap'], optionalAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
    res.status(500).json({ error: 'Failed to load bootstrap data' });
  }
});

// API Routes - registered on both /api/<route> and /<route> for full rewrite compatibility
app.use(['/api/products', '/products'], productsRouter);
app.use(['/api/categories', '/categories'], categoriesRouter);
app.use(['/api/brands', '/brands'], brandsRouter);
app.use(['/api/orders', '/orders'], ordersRouter);
app.use(['/api/banners', '/banners'], bannersRouter);
app.use(['/api/messages', '/messages'], messagesRouter);
app.use(['/api/settings', '/settings'], settingsRouter);
app.use(['/api/vendors', '/vendors'], vendorsRouter);
app.use(['/api/dropshippers', '/dropshippers'], dropshippersRouter);
app.use(['/api/reviews', '/reviews'], reviewsRouter);
app.use(['/api/customers', '/customers'], customersRouter);
app.use(['/api/admin', '/admin'], adminRouter);
app.use(['/api/courier', '/courier', '/api/fardar', '/fardar'], courierRouter);
app.use(['/api/image-proxy', '/image-proxy'], imageProxyRouter);

const getBaseHtml = () => {
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf-8');
    }
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HaveItAll.lk | 100% Authentic Skincare, Supplements & Cosmetics Sri Lanka</title>
    <meta name="description" content="Shop 100% authentic skincare, health supplements, cosmetics, and beauty appliances in Sri Lanka at HaveItAll.lk." />
    <link rel="canonical" href="https://haveitall.lk/" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
};

// Robots.txt
app.get(['/robots.txt', '/api/robots.txt'], (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  res.send(generateRobotsTxt());
});

// Dynamic Sitemap.xml
app.get(['/sitemap.xml', '/sitemap', '/api/sitemap', '/api/sitemap.xml'], async (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
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

// 301 Redirect for standard alternative sitemap index paths
app.get(['/sitemap_index.xml', '/sitemap-index.xml'], (req, res) => {
  return res.redirect(301, '/sitemap.xml');
});

// llms.txt and llms-full.txt machine-readable manifest for AI search engines
app.get(['/llms.txt', '/api/llms.txt'], (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'llms.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
  if (fs.existsSync(filePath)) {
    return res.send(fs.readFileSync(filePath, 'utf-8'));
  }
  return res.send(`# HaveItAll.lk\n> Sri Lanka's trusted online store for 100% authentic global skincare, health supplements, cosmetics, and beauty appliances with islandwide Cash on Delivery.\n\n## Main Catalog Sections\n- [Skincare & Cosmetics](https://haveitall.lk/cosmetics)\n- [Health Supplements](https://haveitall.lk/shop)\n- [Beauty Appliances](https://haveitall.lk/appliances)\n- [Brands Directory](https://haveitall.lk/brands)\n`);
});

app.get(['/llms-full.txt', '/api/llms-full.txt'], (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'llms-full.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
  if (fs.existsSync(filePath)) {
    return res.send(fs.readFileSync(filePath, 'utf-8'));
  }
  return res.redirect(301, '/llms.txt');
});

// 301 Redirects for legacy department typos
app.get(/^\/(cosmatics|applieances|suppliments)(\/.*)?$/, (req, res) => {
  const result = renderSSRHtml(req.path, '');
  if (result.redirect) {
    return res.redirect(result.status || 301, result.redirect);
  }
  res.redirect(301, '/shop');
});

// SSR semantic HTML pre-rendering, metadata injection, and canonical tags
app.get(['/', '/shop', '/cosmetics', '/appliances', '/fashion', '/brands', '/order-tracking', '/faq', '/contact', '/product/:param', '/brand/:param', '/category/:param'], async (req, res, next) => {
  try {
    const [products, brands, categories] = await Promise.all([
      Product.find().lean().catch(() => []),
      Brand.find().lean().catch(() => []),
      Category.find().lean().catch(() => []),
    ]);
    const baseHtml = getBaseHtml();
    const result = renderSSRHtml(req.path, baseHtml, { products, brands, categories });

    if (result.redirect) {
      return res.redirect(result.status || 301, result.redirect);
    }
    if (result.html) {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(result.status || 200).send(result.html);
    }
  } catch (err) {
    console.error('SSR error in serverless:', err);
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

export default app;

