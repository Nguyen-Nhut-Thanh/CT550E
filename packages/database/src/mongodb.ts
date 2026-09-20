import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | undefined;

export function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required to connect to MongoDB");
  }

  connectionPromise ??= mongoose.connect(uri);
  return connectionPromise;
}

export async function disconnectMongo(): Promise<void> {
  connectionPromise = undefined;
  await mongoose.disconnect();
}
