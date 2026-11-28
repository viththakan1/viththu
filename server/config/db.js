import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// Fix for Windows Node.js querySrv ECONNREFUSED when resolving MongoDB Atlas SRV records
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore if not supported in environment
  }
}

// Global Mongoose connection caching for Vercel serverless re-use
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Default URIs provide seamless continuity for live Vercel deployments until MONGODB_URI is configured in Vercel Dashboard
const DEFAULT_MONGODB_URI = 'mongodb+srv://viththakan2001_db_user:VRaEHu2LvFtG9318@cluster0.4lmng0q.mongodb.net/haveitall_store?retryWrites=true&w=majority';
const DIRECT_REPLICA_SET_URI = 'mongodb://viththakan2001_db_user:VRaEHu2LvFtG9318@ac-ds6hqly-shard-00-00.4lmng0q.mongodb.net:27017,ac-ds6hqly-shard-00-01.4lmng0q.mongodb.net:27017,ac-ds6hqly-shard-00-02.4lmng0q.mongodb.net:27017/haveitall_store?ssl=true&replicaSet=atlas-ds6hqly-shard-0&authSource=admin&retryWrites=true&w=majority';

export const connectDB = async () => {
  if (cached.conn && (cached.conn.connection?.readyState >= 1 || mongoose.connection.readyState >= 1)) {
    return cached.conn;
  }

  const primaryUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  const directFallbackUri = process.env.MONGODB_DIRECT_URI || DIRECT_REPLICA_SET_URI;

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
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
        console.warn(`⚠️ Primary MongoDB connection failed (${srvErr.message}). Trying direct replica set fallback...`);
        // 2. Fallback to direct replica set seedlist
        if (directFallbackUri && primaryUri !== directFallbackUri) {
          try {
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
