import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user._id.toString(); // 🔥 MUST MATCH FRONTEND

    console.log("🔥 TOKEN USER ID:", userId);

    const token = generateStreamToken(userId);

    res.status(200).json({ token });
  } catch (error) {
    console.log("❌ Token error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}