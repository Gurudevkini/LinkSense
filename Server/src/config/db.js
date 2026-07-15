import mongoose from "mongoose";

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!dbUri) {
    console.error("❌ MongoDB: Connection URI (MONGODB_URI or MONGO_URI) is missing in .env");
    return false;
  }

  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
};

export default connectDB;
