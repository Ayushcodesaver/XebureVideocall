import { StreamChat } from "stream-chat";
import "dotenv/config";

console.log("=" .repeat(50));
console.log("🔧 INITIALIZING STREAM CLIENT");

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET;

// ✅ SECURITY: Never log actual secrets
console.log("📌 STREAM_API_KEY:", apiKey ? "✅ LOADED" : "❌ MISSING");
console.log("📌 STREAM_SECRET:", apiSecret ? "✅ LOADED" : "❌ MISSING");

if (!apiKey || !apiSecret) {
  console.error("❌ CRITICAL: Stream credentials missing!");
  console.error("   Check your .env file for STREAM_API_KEY and STREAM_SECRET");
  throw new Error("Stream API key or secret missing");
}

let serverClient = null;

try {
  serverClient = StreamChat.getInstance(apiKey, apiSecret);
  console.log("✅ Stream server client initialized");
  console.log("=" .repeat(50));
} catch (error) {
  console.error("❌ Failed to initialize Stream client:", error.message);
  throw error;
}

export const upsertStreamUser = async (userData) => {
  try {
    console.log("   📝 Upserting user:", userData.id);
    const result = await serverClient.upsertUsers([userData]);
    console.log("   ✅ Upsert successful");
    return result;
  } catch (error) {
    console.error("   ❌ Upsert failed:", error.message);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    console.log("   🎫 Creating token for user:", userId);
    // ✅ Set expiry to 1 hour (3600 seconds)
    const expiryTime = Math.floor(Date.now() / 1000) + 3600;
    const token = serverClient.createToken(userId, {
      exp: expiryTime
    });
    console.log("   ✅ Token created with 1-hour expiry");
    return token;
  } catch (error) {
    console.error("   ❌ Token creation failed:", error.message);
    throw error;
  }
};