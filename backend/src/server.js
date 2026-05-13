import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import uploadRoutes from "./routes/upload.route.js";
import streamRoutes from "./routes/stream.routes.js";

import { connectDB } from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env only in development (Vercel provides env vars)
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "../.env") });
}

// 🔍 Debug (remove in production)
if (process.env.NODE_ENV !== "production") {
  console.log("ENV loaded:", {
    key: process.env.STREAM_API_KEY?.substring(0, 10),
    hasSecret: !!process.env.STREAM_SECRET,
  });
}

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS - Allow multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://xebure-videocall-q3hs.vercel.app",
  "https://xebure-videocall.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stream", streamRoutes);

// ✅ Static uploads (optional for Vercel - use Cloudinary)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Production frontend (Vercel handles this better)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

// ✅ Health check endpoint (useful for Vercel)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// ✅ For Vercel serverless deployment
export default app;
