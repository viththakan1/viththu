import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
import { connectDB } from './config/db.js';

import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Brand } from './models/Brand.js';
import { Order } from './models/Order.js';
import { Banner } from './models/Banner.js';
import { Message } from './models/Message.js';
import { Setting } from './models/Setting.js';
import { Vendor } from './models/Vendor.js';
import { Dropshipper } from './models/Dropshipper.js';
import { Review } from './models/Review.js';

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_ORDERS,
  INITIAL_BANNERS,
  INITIAL_MESSAGES,
  INITIAL_SETTINGS,
  INITIAL_VENDORS,
  INITIAL_DROPSHIPPERS,
  INITIAL_REVIEWS
} from '../src/data/initialData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('❌ Could not connect to MongoDB Atlas for seeding.');
      process.exit(1);
    }

    console.log('🧹 Clearing existing collections in haveitall_store...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Order.deleteMany({});
    await Banner.deleteMany({});
    await Message.deleteMany({});
    await Setting.deleteMany({});
    await Vendor.deleteMany({});
    await Dropshipper.deleteMany({});
    await Review.deleteMany({});

    console.log('🌱 Seeding fresh store data to MongoDB Atlas...');
    await Product.insertMany(INITIAL_PRODUCTS);
    await Category.insertMany(INITIAL_CATEGORIES);
    await Brand.insertMany(INITIAL_BRANDS);
    await Order.insertMany(INITIAL_ORDERS);
    await Banner.insertMany(INITIAL_BANNERS);
    await Message.insertMany(INITIAL_MESSAGES);
    await Setting.create({ key: 'main_settings', ...INITIAL_SETTINGS });
    await Vendor.insertMany(INITIAL_VENDORS);
    await Dropshipper.insertMany(INITIAL_DROPSHIPPERS);
    await Review.insertMany(INITIAL_REVIEWS);

    console.log('✅ MongoDB Atlas successfully populated with initial store data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding MongoDB Atlas database:', error);
    process.exit(1);
  }
};

seedDatabase();
