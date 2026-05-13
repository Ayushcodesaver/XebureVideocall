import express from "express";
import { getStreamToken } from "../controllers/stream.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);

export default router;