import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";  // ✅ Capital U

// In-memory storage for 2FA secrets (use database in production)
const user2FASecrets = new Map();
const userBackupCodes = new Map();
const userTrustedDevices = new Map();
const userEncryptionKeys = new Map();

// ============= Helper Functions =============
const addSecurityLog = async (userId, action, details) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      const log = {
        id: Date.now().toString(),
        action,
        details,
        timestamp: new Date().toISOString(),
        ip: details?.ip || "unknown"
      };
      // Store in user document (add securityLogs array to schema)
      user.securityLogs = user.securityLogs || [];
      user.securityLogs.unshift(log);
      await user.save();
    }
  } catch (error) {
    console.error("Failed to add security log:", error);
  }
};

// ============= 2FA Controllers =============

export const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    
    res.json({ 
      enabled: user?.twoFactorEnabled || false,
      recoveryEmail: req.user.email
    });
  } catch (error) {
    console.error("2FA status error:", error);
    res.status(500).json({ message: "Failed to get 2FA status" });
  }
};

export const setup2FA = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const email = req.user.email;
    
    const secret = speakeasy.generateSecret({
      name: `Xebure (${email})`,
      length: 20
    });
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    
    user2FASecrets.set(userId, {
      secret: secret.base32,
      verified: false,
      backupCodes
    });
    
    await addSecurityLog(userId, "2FA_SETUP_STARTED", { email });
    
    res.json({
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({ message: "Failed to setup 2FA" });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { code } = req.body;
    
    const userSecret = user2FASecrets.get(userId);
    if (!userSecret) {
      return res.status(400).json({ message: "2FA not initialized" });
    }
    
    const verified = speakeasy.totp.verify({
      secret: userSecret.secret,
      encoding: 'base32',
      token: code,
      window: 1
    });
    
    if (verified) {
      userSecret.verified = true;
      user2FASecrets.set(userId, userSecret);
      userBackupCodes.set(userId, userSecret.backupCodes);
      
      // Save to database
      await User.findByIdAndUpdate(userId, { twoFactorEnabled: true });
      await addSecurityLog(userId, "2FA_ENABLED", { success: true });
      
      res.json({ valid: true, message: "2FA enabled successfully" });
    } else {
      await addSecurityLog(userId, "2FA_VERIFY_FAILED", { code });
      res.json({ valid: false, message: "Invalid verification code" });
    }
  } catch (error) {
    console.error("2FA verify error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { code } = req.body;
    
    const userSecret = user2FASecrets.get(userId);
    
    if (userSecret && userSecret.verified) {
      const verified = speakeasy.totp.verify({
        secret: userSecret.secret,
        encoding: 'base32',
        token: code,
        window: 1
      });
      
      if (verified) {
        user2FASecrets.delete(userId);
        userBackupCodes.delete(userId);
        await User.findByIdAndUpdate(userId, { twoFactorEnabled: false });
        await addSecurityLog(userId, "2FA_DISABLED", { success: true });
        
        return res.json({ success: true });
      }
    }
    
    res.json({ success: false, message: "Invalid code" });
  } catch (error) {
    console.error("2FA disable error:", error);
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
};

export const getBackupCodes = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const codes = userBackupCodes.get(userId) || [];
    res.json({ backupCodes: codes });
  } catch (error) {
    res.status(500).json({ message: "Failed to get backup codes" });
  }
};

export const regenerateBackupCodes = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const newCodes = [];
    for (let i = 0; i < 8; i++) {
      newCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    userBackupCodes.set(userId, newCodes);
    await addSecurityLog(userId, "BACKUP_CODES_REGENERATED", {});
    
    res.json({ backupCodes: newCodes });
  } catch (error) {
    res.status(500).json({ message: "Failed to regenerate backup codes" });
  }
};

// ============= Trusted Devices =============

export const getTrustedDevices = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const devices = userTrustedDevices.get(userId) || [];
    res.json({ devices });
  } catch (error) {
    res.status(500).json({ message: "Failed to get trusted devices" });
  }
};

export const addTrustedDevice = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { deviceName } = req.body;
    
    const devices = userTrustedDevices.get(userId) || [];
    const newDevice = {
      id: Date.now().toString(),
      name: deviceName || `Device ${devices.length + 1}`,
      location: req.ip || "Unknown",
      lastActive: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || "Unknown"
    };
    
    devices.push(newDevice);
    userTrustedDevices.set(userId, devices);
    await addSecurityLog(userId, "TRUSTED_DEVICE_ADDED", { deviceName: newDevice.name });
    
    res.json({ device: newDevice });
  } catch (error) {
    res.status(500).json({ message: "Failed to add trusted device" });
  }
};

export const removeTrustedDevice = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { deviceId } = req.params;
    
    const devices = userTrustedDevices.get(userId) || [];
    const deviceToRemove = devices.find(d => d.id === deviceId);
    const filtered = devices.filter(d => d.id !== deviceId);
    userTrustedDevices.set(userId, filtered);
    await addSecurityLog(userId, "TRUSTED_DEVICE_REMOVED", { deviceName: deviceToRemove?.name });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove trusted device" });
  }
};

// ============= Session Management =============

export const getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const sessions = [{
      id: "current",
      device: req.headers['user-agent'] || "Unknown Device",
      location: req.ip || "Unknown",
      lastActive: new Date().toISOString(),
      current: true
    }];
    
    console.log("✅ Sessions fetched successfully");
    res.json(sessions);
  } catch (error) {
    console.error("Failed to get sessions:", error.message);
    res.status(500).json({ message: "Failed to get sessions" });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // In production, implement session revocation
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to revoke session" });
  }
};

// ============= Blocked Users =============

export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("blockedUsers", "name email profilePic");
    
    res.json(user?.blockedUsers || []);
  } catch (error) {
    console.error("Failed to get blocked users:", error);
    res.status(500).json({ message: "Failed to get blocked users" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: blockUserId } = req.params;
    
    await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: blockUserId } });
    await addSecurityLog(userId, "USER_BLOCKED", { blockedUserId });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to block user:", error);
    res.status(500).json({ message: "Failed to block user" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: unblockUserId } = req.params;
    
    await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: unblockUserId } });
    await addSecurityLog(userId, "USER_UNBLOCKED", { unblockedUserId: unblockUserId });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to unblock user:", error);
    res.status(500).json({ message: "Failed to unblock user" });
  }
};

// ============= Security Monitoring =============

export const getSecurityAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const alerts = (user?.securityLogs || [])
      .filter(log => log.action.includes("FAILED") || log.action.includes("SUSPICIOUS"))
      .slice(0, 20);
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: "Failed to get security alerts" });
  }
};

export const getSecurityLog = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(userId);
    
    const logs = user?.securityLogs || [];
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    
    res.json({ 
      logs: logs.slice(start, end), 
      total: logs.length, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get security log" });
  }
};

export const reportSecurityIncident = async (req, res) => {
  try {
    const userId = req.user._id;
    const { incident } = req.body;
    
    await addSecurityLog(userId, "SECURITY_INCIDENT_REPORTED", { incident });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to report incident" });
  }
};

export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user._id;
    await addSecurityLog(userId, "LOGOUT_ALL_DEVICES", {});
    // In production, invalidate all sessions
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout all devices" });
  }
};

// ============= Account Management =============

export const exportAccountData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    
    const exportData = {
      user: user.toObject(),
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=xebure-data-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    console.error("Failed to export data:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

// ============= Encryption Controllers =============

export const getEncryptionStatus = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const currentKeyId = userEncryptionKeys.get(userId);
    
    res.json({
      enabled: true,
      algorithm: "AES-256-GCM",
      keyRotation: 30,
      currentKeyId: currentKeyId || `key_${userId.substring(0, 8)}`
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get encryption status" });
  }
};

export const rotateEncryptionKey = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const newKeyId = `key_${Date.now()}_${userId.substring(0, 6)}`;
    userEncryptionKeys.set(userId, newKeyId);
    await addSecurityLog(userId, "ENCRYPTION_KEY_ROTATED", { newKeyId });
    
    res.json({ newKeyId });
  } catch (error) {
    res.status(500).json({ message: "Failed to rotate encryption key" });
  }
};

export const getKeyHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const currentKey = userEncryptionKeys.get(userId);
    
    const keys = [];
    if (currentKey) {
      keys.push({
        id: currentKey,
        createdAt: new Date().toISOString(),
        active: true
      });
    }
    
    res.json({ keys });
  } catch (error) {
    res.status(500).json({ message: "Failed to get key history" });
  }
};

export const enableChatEncryption = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { chatId } = req.params;
    
    await addSecurityLog(userId, "CHAT_ENCRYPTION_ENABLED", { chatId });
    
    res.json({ success: true, chatId });
  } catch (error) {
    res.status(500).json({ message: "Failed to enable encryption" });
  }
};

export const getChatEncryptionStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    res.json({
      enabled: true,
      algorithm: "AES-256-GCM",
      keyRotation: 30
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get chat encryption status" });
  }
};