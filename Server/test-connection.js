import mongoose from "mongoose";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URL = process.env.REDIS_URL;

async function testConnections() {
  console.log("====== LinkSense Connection Test ======\n");

  // -----------------------------
  // REDIS TEST
  // -----------------------------
  if (!REDIS_URL) {
    console.error("❌ Redis: REDIS_URL missing in .env");
  } else {
    try {
      console.log("⏳ Connecting to Redis...");
      const redis = new Redis(REDIS_URL);

      const ping = await redis.ping();
      console.log("✅ Redis Connected");
      console.log("Redis Ping:", ping);

      await redis.quit();
    } catch (err) {
      console.error("\n❌ Redis Connection Failed");
      console.error("--------------------------------");
      console.error("Name:", err.name);
      console.error("Message:", err.message);
      console.error("Code:", err.code);
      console.error("Stack:\n", err.stack);
      console.error("--------------------------------\n");
    }
  }

  console.log("\n=======================================\n");

  // -----------------------------
  // MONGODB TEST
  // -----------------------------
  if (!MONGODB_URI) {
    console.error("❌ MongoDB: MONGODB_URI missing in .env");
  } else {
    try {
      console.log("⏳ Connecting to MongoDB...");
      console.log("Mongo URI:", MONGODB_URI.replace(/:(.*?)@/, ":********@"));

      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
      });

      console.log("✅ MongoDB Connected Successfully!");

      await mongoose.disconnect();
    } catch (err) {
      console.error("\n❌ MongoDB Connection Failed");
      console.error("--------------------------------");
      console.error("Name:", err.name);
      console.error("Message:", err.message);
      console.error("Code:", err.code);
      console.error("Cause:", err.cause);
      console.error("Reason:", err.reason);
      console.error("Error Labels:", err.errorLabels);
      console.error("Full Error Object:");
      console.dir(err, { depth: null, colors: true });
      console.error("--------------------------------");
      console.error("Stack Trace:");
      console.error(err.stack);
      console.error("--------------------------------\n");
    }
  }

  console.log("\n====== Test Completed ======");
  process.exit(0);
}

testConnections();