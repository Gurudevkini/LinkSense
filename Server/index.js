import "./src/config/env.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { setStorageMode } from "./src/services/urlService.js";

const PORT = process.env.PORT || 5000;

// Try to connect to MongoDB, then configure the service storage mode
console.log("⚡ Starting LinkSense Server...");
const mongoConnected = await connectDB();
setStorageMode(mongoConnected);

if (!mongoConnected) {
  console.warn("⚠️ MongoDB connection bypassed. Falling back to secure in-memory storage mode.");
}

app.listen(PORT, () => {
  console.log(`🚀 LinkSense Server is actively listening on port ${PORT}`);
});