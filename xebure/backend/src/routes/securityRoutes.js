import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  setup2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
  getBackupCodes,
  regenerateBackupCodes,
  getTrustedDevices,
  addTrustedDevice,
  removeTrustedDevice,
  getSecurityAlerts,
  getSecurityLog,
  reportSecurityIncident,
  logoutAllDevices,
  getEncryptionStatus,
  rotateEncryptionKey,
  getKeyHistory,
  enableChatEncryption,
  getChatEncryptionStatus,
  getBlockedUsers,
  blockUser,
  unblockUser,
  getSessions,
  revokeSession,
  exportAccountData,
  deleteAccount
} from "../controllers/security.controller.js";

const router = express.Router();

// ============= 2FA Routes =============
router.get("/auth/2fa/status", protectRoute, get2FAStatus);
router.post("/auth/2fa/setup", protectRoute, setup2FA);
router.post("/auth/2fa/verify", protectRoute, verify2FA);
router.post("/auth/2fa/disable", protectRoute, disable2FA);
router.get("/auth/2fa/backup-codes", protectRoute, getBackupCodes);
router.post("/auth/2fa/backup-codes/regenerate", protectRoute, regenerateBackupCodes);

// ============= Trusted Devices Routes =============
router.get("/auth/trusted-devices", protectRoute, getTrustedDevices);
router.post("/auth/trusted-devices", protectRoute, addTrustedDevice);
router.delete("/auth/trusted-devices/:deviceId", protectRoute, removeTrustedDevice);

// ============= Security Monitoring Routes =============
router.get("/auth/security-alerts", protectRoute, getSecurityAlerts);
router.get("/auth/security-log", protectRoute, getSecurityLog);
router.post("/auth/security-incidents", protectRoute, reportSecurityIncident);
router.post("/auth/logout-all", protectRoute, logoutAllDevices);

// ============= Session Management =============
router.get("/auth/sessions", protectRoute, getSessions);
router.delete("/auth/sessions/:sessionId", protectRoute, revokeSession);

// ============= Blocked Users =============
router.get("/users/blocked", protectRoute, getBlockedUsers);
router.post("/users/blocked/:userId", protectRoute, blockUser);
router.delete("/users/blocked/:userId", protectRoute, unblockUser);

// ============= Account Management =============
router.get("/account/export", protectRoute, exportAccountData);
router.delete("/account", protectRoute, deleteAccount);

// ============= Encryption Routes =============
router.get("/encryption/status", protectRoute, getEncryptionStatus);
router.post("/encryption/rotate-key", protectRoute, rotateEncryptionKey);
router.get("/encryption/key-history", protectRoute, getKeyHistory);
router.post("/encryption/enable/:chatId", protectRoute, enableChatEncryption);
router.get("/encryption/chat-status/:chatId", protectRoute, getChatEncryptionStatus);

export default router;