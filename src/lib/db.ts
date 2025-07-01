import mongoose from "mongoose";
import transaction from "./models/transaction";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("Please include a MONGO_URI environment variable in .env.local");
}

// Initialize the cache on globalThis
if (!global.dbCache) {
  global.dbCache = { conn: null, promise: null };
}

// Alias for convenience
const cache = global.dbCache;

const connectDB = async (): Promise<mongoose.Mongoose> => {
  // Reuse existing connection
  if (cache.conn) {
    return cache.conn;
  }

  // Kick off initial connect
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }

  // Ensure indexes
  await transaction.syncIndexes();

  return cache.conn;
};

export default connectDB;
