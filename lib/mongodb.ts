// /lib/mongodb.ts
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  // During build time, we don't need a real database connection
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    console.warn('MONGODB_URI not defined. Using placeholder for build.');
  } else {
    throw new Error("Please add your Mongo URI to .env.local");
  }
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

// If no URI is available (e.g., during build), create a mock promise
if (!uri) {
  clientPromise = Promise.reject(new Error('MongoDB URI not available'));
} else if (process.env.NODE_ENV === "development") {
  // Use a global variable in development to avoid multiple instances
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;