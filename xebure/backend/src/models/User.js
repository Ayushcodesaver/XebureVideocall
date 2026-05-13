import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ============= 🔥 IDENTITY FIELDS =============
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_.]+$/,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
    // ============= 🔥 ONLINE STATUS FIELDS =============
    onlineStatus: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    
    // ============= 🔥 SECURITY FIELDS =============
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorBackupCodes: [{
      type: String,
    }],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    securityLogs: [
      {
        id: {
          type: String,
          default: () => Date.now().toString(),
        },
        action: {
          type: String,
          enum: [
            "2FA_SETUP_STARTED",
            "2FA_ENABLED",
            "2FA_DISABLED",
            "2FA_VERIFY_FAILED",
            "BACKUP_CODES_REGENERATED",
            "TRUSTED_DEVICE_ADDED",
            "TRUSTED_DEVICE_REMOVED",
            "USER_BLOCKED",
            "USER_UNBLOCKED",
            "SECURITY_INCIDENT_REPORTED",
            "LOGOUT_ALL_DEVICES",
            "ENCRYPTION_KEY_ROTATED",
            "CHAT_ENCRYPTION_ENABLED",
            "LOGIN_SUCCESS",
            "LOGIN_FAILED",
            "PASSWORD_CHANGED",
            "EMAIL_CHANGED"
          ],
        },
        details: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        ip: {
          type: String,
          default: "unknown",
        },
        userAgent: {
          type: String,
          default: "",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    trustedDevices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        deviceName: {
          type: String,
          required: true,
        },
        lastUsed: {
          type: Date,
          default: Date.now,
        },
        ip: {
          type: String,
        },
        userAgent: {
          type: String,
        },
        isTrusted: {
          type: Boolean,
          default: true,
        },
      },
    ],
    encryptionKeyId: {
      type: String,
      default: null,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Generate username from email if not provided (for existing users)
userSchema.pre("save", async function (next) {
  if (!this.username && this.email) {
    let baseUsername = this.email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '_');
    let username = baseUsername;
    let counter = 1;
    
    // Check if username already exists
    const User = mongoose.model("User");
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    this.username = username;
  }
  next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  
  // Log failed login attempt
  if (!isPasswordCorrect) {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.accountLocked = true;
      this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
    await this.save();
  } else {
    // Reset login attempts on successful login
    if (this.loginAttempts > 0) {
      this.loginAttempts = 0;
      this.accountLocked = false;
      this.lockUntil = null;
      await this.save();
    }
  }
  
  return isPasswordCorrect;
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  if (!this.accountLocked) return false;
  if (this.lockUntil && this.lockUntil < new Date()) {
    // Lock expired
    this.accountLocked = false;
    this.lockUntil = null;
    this.loginAttempts = 0;
    this.save();
    return false;
  }
  return true;
};

// Add security log method
userSchema.methods.addSecurityLog = async function (action, details = {}, ip = "unknown", userAgent = "") {
  this.securityLogs.unshift({
    id: Date.now().toString(),
    action,
    details,
    ip,
    userAgent,
    timestamp: new Date(),
  });
  
  // Keep only last 100 logs
  if (this.securityLogs.length > 100) {
    this.securityLogs = this.securityLogs.slice(0, 100);
  }
  
  await this.save();
};

// Get recent security alerts
userSchema.methods.getSecurityAlerts = function () {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return this.securityLogs.filter(log => 
    new Date(log.timestamp) > sevenDaysAgo && 
    (log.action.includes("FAILED") || log.action.includes("SUSPICIOUS"))
  );
};

const User = mongoose.model("User", userSchema);
export default User;