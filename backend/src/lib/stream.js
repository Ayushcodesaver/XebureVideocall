import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;      // ✅ सही नाम
const apiSecret = process.env.STREAM_SECRET;    // ✅ सही नाम

console.log("🔑 BACKEND STREAM KEY:", apiKey);
console.log("🔐 BACKEND STREAM SECRET:", apiSecret ? "loaded" : "missing");

if (!apiKey || !apiSecret) {
  throw new Error("❌ Stream API key or secret missing");
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// ✅ create/update user in Stream
export const upsertStreamUser = async (userData) => {
  return await serverClient.upsertUsers([userData]);
};

// ✅ generate token (IMPORTANT)
export const generateStreamToken = (userId) => {
  return serverClient.createToken(userId.toString());
};