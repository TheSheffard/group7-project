import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("� MONGODB_URI not set — using in-memory store");
    return;
  }
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("🔌 MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}