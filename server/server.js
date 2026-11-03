import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
import { connectDB } from './config/db.js';

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HAVEITALL Backend API is connected and running',
    timestamp: new Date().toISOString()
  });
});

// Single-roundtrip Bootstrap endpoint
app.get('/api/bootstrap', async (req, res) => {
  try {
    const [products, categories, brands, banners, settings, vendors, dropshippers, reviews, orders, messages] = await Promise.all([
      Product.find().lean(),
      Category.find().lean(),
      Brand.find().lean(),
      Banner.find().lean(),
      Setting.findOne().lean(),
      Vendor.find().lean(),
      Dropshipper.find().lean(),
      Review.find().lean(),
      Order.find().lean(),
      Message.find().lean(),
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

// Serve frontend production build if available
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
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
