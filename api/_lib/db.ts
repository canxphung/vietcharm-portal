import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/vietcharm';

let connectionPromise: Promise<typeof mongoose> | null = null;

/** Lazy singleton connection, safe to call repeatedly (Express requests, Vercel warm invocations). */
export function connectDB(): Promise<typeof mongoose> {
  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI || DEFAULT_URI;
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
}
