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

const DEFAULT_MONGODB_URI = 'mongodb+srv://viththakan2001_db_user:VRaEHu2LvFtG9318@cluster0.4lmng0q.mongodb.net/haveitall_store?retryWrites=true&w=majority';
// Direct standard replica set URI fallback to bypass Windows querySrv DNS resolution errors
const DIRECT_REPLICA_SET_URI = 'mongodb://viththakan2001_db_user:VRaEHu2LvFtG9318@ac-ds6hqly-shard-00-00.4lmng0q.mongodb.net:27017,ac-ds6hqly-shard-00-01.4lmng0q.mongodb.net:27017,ac-ds6hqly-shard-00-02.4lmng0q.mongodb.net:27017/haveitall_store?ssl=true&replicaSet=atlas-ds6hqly-shard-0&authSource=admin&retryWrites=true&w=majority';

export const connectDB = async () => {
  if (cached.conn && (cached.conn.connection?.readyState >= 1 || mongoose.connection.readyState >= 1)) {
    return cached.conn;
  }

  const primaryUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

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
        // 2. Fallback to direct replica set seedlist (bypasses Windows querySrv bug)
        if (primaryUri !== DIRECT_REPLICA_SET_URI) {
          try {
            const fallbackInstance = await mongoose.connect(DIRECT_REPLICA_SET_URI, opts);
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
