import { StreamChat } from "stream-chat";
import dotenv from "dotenv";
import path from "path";

// 🔥 force load env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET;

console.log("STREAM ENV:", {
  key: apiKey,
  secret: apiSecret ? "loaded" : "missing",
});

// ❌ अगर key missing → fail fast
if (!apiKey || !apiSecret) {
  throw new Error("❌ STREAM ENV NOT LOADED PROPERLY");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  return await streamClient.upsertUsers([userData]);
};

export const generateStreamToken = (userId) => {
  return streamClient.createToken(userId.toString());
};