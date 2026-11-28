import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// Global Mongoose connection caching for Vercel serverless re-use
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn && (cached.conn.connection?.readyState >= 1 || mongoose.connection.readyState >= 1)) {
    return cached.conn;
  }

  const primaryUri = process.env.MONGODB_URI;
  const directFallbackUri = process.env.MONGODB_DIRECT_URI;

  if (!primaryUri) {
    const errorMsg = 'CRITICAL SECURITY/CONFIG: MONGODB_URI environment variable is not defined.';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    cached.promise = (async () => {
      // 1. Try primary URI (SRV or configured)
      try {
        const instance = await mongoose.connect(primaryUri, opts);
        console.log(`✅ MongoDB Atlas Connected: ${instance.connection.host}/${instance.connection.name}`);
        return instance;
      } catch (srvErr) {
        console.warn(`⚠️ Primary MongoDB connection failed (${srvErr.message}).`);
        // 2. Fallback to direct replica set seedlist if provided via environment
        if (directFallbackUri && primaryUri !== directFallbackUri) {
          try {
            console.log('🔄 Attempting connection via MONGODB_DIRECT_URI fallback...');
            const fallbackInstance = await mongoose.connect(directFallbackUri, opts);
            console.log(`✅ MongoDB Atlas Connected via Direct Replica Set: ${fallbackInstance.connection.host}/${fallbackInstance.connection.name}`);
            return fallbackInstance;
          } catch (directErr) {
            console.error(`❌ MongoDB Direct Replica Set Connection Error: ${directErr.message}`);
            throw directErr;
          }
        }
        throw srvErr;
      }
    })().catch((error) => {
      cached.promise = null;
      console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
};
