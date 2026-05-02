import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user._id.toString();

    // 🔥 FORCE USER CREATE (MOST IMPORTANT)
    await upsertStreamUser({
      id: userId,
      name: req.user.fullName || "User",
      image: req.user.profilePic || "",
    });

    console.log("👤 STREAM USER CREATED:", userId);

    const token = generateStreamToken(userId);

    res.status(200).json({ token });
  } catch (error) {
    console.log("❌ Token error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}