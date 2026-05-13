import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit"; // ✅ SECURITY: Rate limiting
import helmet from "helmet"; // ✅ SECURITY: HTTP headers

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import uploadRoutes from "./routes/upload.route.js";
import streamRoutes from "./routes/stream.routes.js";
import securityRoutes from "./routes/securityRoutes.js"; // ✅ ADDED

import { connectDB } from "./lib/db.js";

/* ================== 🔥 FIX START ================== */

// ❗ ABSOLUTE PATH (NO GUESS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 FORCE सही path: backend/.env
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

// 🔎 DEBUG (keep temporarily - but never log secrets!)
console.log("✅ Environment loaded from backend/.env");

/* ================== 🔥 FIX END ================== */

const app = express();
const PORT = process.env.PORT || 5001;

/* ✅ SECURITY: Rate Limiting */
// Limit token generation requests (stricter)
const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: "⚠️ Too many token requests, please try again later",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?._id?.toString() || req.ip;
  }
});

// General API rate limiting (more lenient)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ SECURITY: Set HTTP security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable if conflicts with your CSP
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS resources
  hsts: { maxAge: 31536000, includeSubDomains: true }, // 1 year HSTS
}));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter); // ✅ Apply general rate limiting

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stream", tokenLimiter, streamRoutes); // ✅ SECURITY: Strict rate limit on tokens
app.use("/api", securityRoutes); // ✅ ADDED - This handles /api/auth/2fa/* and /api/encryption/*

// ✅ Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Production frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../../frontend/dist/index.html")
    );
  });
}

// ✅ Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});