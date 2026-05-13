import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  // ============= 🔥 NEW =============
  searchUsers,
  getUserByUsername,
  getSuggestions,
  getUserOnlineStatus,  // ✅ ADD THIS
  updateUserOnlineStatus, // ✅ ADD THIS
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

// ============= EXISTING =============
router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

// ============= 🔥 NEW ROUTES =============
router.get("/search", searchUsers);
router.get("/suggestions", getSuggestions);

// ============= 🔥 ONLINE STATUS ROUTES =============
router.get("/:userId/status", getUserOnlineStatus);  // Get user's online status
router.post("/update-status", updateUserOnlineStatus);  // Update current user's status

// ⚠️ Keep this LAST (after all specific routes)
router.get("/:username", getUserByUsername);

export default router;