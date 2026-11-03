import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/config/db.js';

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

dotenv.config();

const app = express();

// Ensure MongoDB Atlas is connected on each incoming serverless invocation
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in serverless handler:', err);
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HAVEITALL Backend API is connected and running on Vercel Serverless',
    timestamp: new Date().toISOString()
  });
});

// Single-roundtrip Bootstrap endpoint for high performance
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;

