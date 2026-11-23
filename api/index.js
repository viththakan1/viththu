import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
import { backfillProductSlugs } from '../server/utils/backfillSlugs.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check - always available immediately
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HAVEITALL Backend API is connected and running on Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

// Ensure MongoDB Atlas is connected on each incoming serverless invocation
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in serverless handler:', err);
  }
  next();
});

// Single-roundtrip Bootstrap endpoint for high performance
app.get('/api/bootstrap', async (req, res) => {
  try {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    const [products, categories, brands, banners, settings, vendors, dropshippers, reviews, orders, messages] = await Promise.all([
      Product.find().lean().catch(() => []),
      Category.find().lean().catch(() => []),
      Brand.find().lean().catch(() => []),
      Banner.find().lean().catch(() => []),
      Setting.findOne().lean().catch(() => null),
      Vendor.find().lean().catch(() => []),
      Dropshipper.find().lean().catch(() => []),
      Review.find().lean().catch(() => []),
      Order.find().lean().catch(() => []),
      Message.find().lean().catch(() => [])
    ]);
    res.json({
      products: products || [],
      categories: categories || [],
      brands: brands || [],
      banners: banners || [],
      settings: settings || null,
      vendors: vendors || [],
      dropshippers: dropshippers || [],
      reviews: reviews || [],
      orders: orders || [],
      messages: messages || []
    });
  } catch (err) {
    console.error('Bootstrap error:', err.message);
    res.status(500).json({ error: err.message });
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
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(generateRobotsTxt());
});

// Dynamic Sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const [products, brands, categories] = await Promise.all([
      Product.find().lean().catch(() => []),
      Brand.find().lean().catch(() => []),
      Category.find().lean().catch(() => []),
    ]);
    const xml = generateSitemapXml(products, brands, categories);
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    const xml = generateSitemapXml();
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  }
});

// 301 Redirects for legacy department typos
app.get(['/cosmatics', '/cosmatics/*', '/applieances', '/applieances/*', '/suppliments', '/suppliments/*'], (req, res) => {
  const result = renderSSRHtml(req.path, '');
  if (result.redirect) {
    return res.redirect(result.status || 301, result.redirect);
  }
  res.redirect(301, '/shop');
});

// SSR metadata injection and 301 redirects for Product, Brand, and Category pages
app.get(['/product/:param', '/brand/:param', '/category/:param'], async (req, res, next) => {
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
      return res.status(result.status || 200).send(result.html);
    }
  } catch (err) {
    console.error('SSR error in serverless:', err);
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;

