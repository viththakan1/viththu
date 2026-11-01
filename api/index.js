import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/config/db.js';

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
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HAVEITALL Backend API is connected and running on Vercel Serverless',
    timestamp: new Date().toISOString()
  });
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;

