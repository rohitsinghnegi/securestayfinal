import dotenv from "dotenv";
// Load environment variables from backend.env at the very beginning
dotenv.config({ path: './backend.env' });

import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initSocket } from './socket.js'; // Import our socket initialization

// Routes
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import maintenanceRoutes from "./routes/maintenance.js";
import paymentRoutes from "./routes/payments.js";
import roomRoutes from "./routes/rooms.js";
import bookingRoutes from "./routes/bookings.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import verificationRoutes from "./routes/verification.js";
import geminiRoutes from "./routes/gemini.js";
import chatRoutes from "./routes/chat.js"; // Add chat routes
import uploadRoutes from "./routes/upload.js"; // Add upload routes

const app = express();
const server = http.createServer(app);

// Configure CORS to allow one or more frontend origins (ports)
const rawOrigins = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

// Initialize Socket.io with our enhanced implementation
const io = initSocket(server, allowedOrigins);
const devLocalhostOriginPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow same-origin/no origin (e.g. curl, mobile)
      const isAllowedExact = allowedOrigins.includes(origin);
      const isLocalhostDev = devLocalhostOriginPatterns.some((re) => re.test(origin));
      if (isAllowedExact || isLocalhostDev) return callback(null, true);
      console.warn("CORS blocked origin:", origin);
      return callback(new Error("CORS: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/photo", express.static(path.join(__dirname, "photo")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/chat", chatRoutes); // Add chat routes
app.use("/api/upload", uploadRoutes); // Add upload routes

// Simple health endpoint to verify server and socket layer
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Test Gemini endpoint
app.get("/api/test-gemini-setup", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test if API key is valid by listing models
    const models = await genAI.listModels();
    const availableModels = models.map(m => m.name);
    
    res.json({ 
      status: "API Key is valid!",
      availableModels: availableModels,
      totalModels: availableModels.length,
      message: "Try these model names in your gemini.js route"
    });
  } catch (error) {
    res.status(500).json({ 
      error: "API Key test failed",
      details: error.message,
      suggestion: "Make sure you're using a Gemini API key from https://aistudio.google.com/apikey"
    });
  }
});

// Socket implementation is now handled in socket.js



// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/securestay";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    // Drop stale unique index on students.username if it exists
    try {
      const db = mongoose.connection.db;
      const ensureIndexDropped = async (collectionName, indexName) => {
        try {
          const coll = db.collection(collectionName);
          const indexes = await coll.indexes();
          if (indexes.some((i) => i.name === indexName)) {
            await coll.dropIndex(indexName);
            console.log(`Dropped stale index ${collectionName}.${indexName}`);
          }
        } catch (e) {
          console.warn(`Index cleanup skipped for ${collectionName}.${indexName}:`, e?.message || e);
        }
      };

      await ensureIndexDropped("students", "username_1");
      await ensureIndexDropped("students", "mobile_1");
      await ensureIndexDropped("landlords", "mobile_1");
    } catch (e) {
      console.warn("Index cleanup skipped:", e?.message || e);
    }
    console.log("CORS allowed origins:", allowedOrigins);
    
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));