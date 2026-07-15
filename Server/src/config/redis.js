import Redis from "ioredis";

let redis = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
    });
    
    redis.on("connect", () => {
      console.log("✅ Redis Client Connected");
    });

    redis.on("error", (err) => {
      console.warn("⚠️ Redis Client Error:", err.message);
    });
  } catch (err) {
    console.error("❌ Redis client initialization failed:", err.message);
  }
} else {
  console.warn("⚠️ Redis: REDIS_URL missing in .env. Caching will be bypassed.");
}

export default redis;
