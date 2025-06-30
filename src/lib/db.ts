import mongoose from "mongoose";
import transaction from "./models/transaction";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("Please include a MONGO_URI environment variable in .env.local");
}

let cache = (global as any).mongoose;

if (!cache) {
    cache = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cache.conn) {
        return cache.conn;
    }

    if (!cache.promise) {
        cache.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cache.conn = await cache.promise;
    } catch (e) {
        cache.promise = null;
        throw e;
    }

    await transaction.syncIndexes()

    return cache.conn;
};

export default connectDB;