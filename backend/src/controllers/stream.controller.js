import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    console.log("=" .repeat(50));
    console.log("📡 TOKEN REQUEST RECEIVED");
    
    // Check authentication
    if (!req.user) {
      console.error("❌ No user in request - Auth middleware failed");
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    
    if (!req.user._id) {
      console.error("❌ User has no _id field:", req.user);
      return res.status(401).json({ message: "Unauthorized: Invalid user data" });
    }
    
    const userId = req.user._id.toString();
    console.log("👤 User ID:", userId);
    console.log("👤 User Name:", req.user.fullName);
    
    // Step 1: Upsert user to Stream (optional but good)
    try {
      console.log("📝 Upserting user to Stream...");
      await upsertStreamUser({
        id: userId,
        name: req.user.fullName || "User",
        image: req.user.profilePic || "",
      });
      console.log("✅ User upserted successfully");
    } catch (upsertError) {
      // Don't fail - we can still generate token
      console.warn("⚠️ User upsert failed (continuing):", upsertError.message);
    }
    
    // Step 2: Generate token
    console.log("🎫 Generating token...");
    const token = generateStreamToken(userId);
    
    if (!token) {
      throw new Error("Token generation returned empty");
    }
    
    console.log("✅ Token generated successfully");
    console.log("📏 Token length:", token.length);
    console.log("=" .repeat(50));
    
    // Send response
    res.status(200).json({ 
      token: token,
      userId: userId,
      apiKey: process.env.STREAM_API_KEY 
    });
    
  } catch (error) {
    console.error("=" .repeat(50));
    console.error("❌ TOKEN ERROR:", error.message);
    console.error("📚 Stack:", error.stack);
    console.error("=" .repeat(50));
    
    res.status(500).json({ 
      message: "Failed to generate Stream token",
      error: error.message 
    });
  }
}