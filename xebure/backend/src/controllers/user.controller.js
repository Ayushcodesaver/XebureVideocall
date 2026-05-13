import mongoose from "mongoose";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// ============= 🔥 EXISTING FUNCTIONS (FRIEND REQUESTS) =============

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
// ============= 🔥 ONLINE STATUS FUNCTIONS =============

// Get user's online status
export async function getUserOnlineStatus(req, res) {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("onlineStatus lastSeen");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      isOnline: user.onlineStatus || false,
      lastSeen: user.lastSeen
    });
  } catch (error) {
    console.error("Error in getUserOnlineStatus:", error.message);
    res.status(500).json({ success: false, isOnline: false });
  }
}

// Update current user's online status
export async function updateUserOnlineStatus(req, res) {
  try {
    const { isOnline } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        onlineStatus: isOnline,
        lastSeen: new Date()
      },
      { new: true }
    );
    
    res.json({ 
      success: true, 
      isOnline: updatedUser.onlineStatus,
      lastSeen: updatedUser.lastSeen
    });
  } catch (error) {
    console.error("Error in updateUserOnlineStatus:", error.message);
    res.status(500).json({ success: false });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage username");
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exists" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage username");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.error("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage username");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ============= 🔍 NEW FUNCTION 1: SEARCH USERS =============
export async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    const searchPattern = new RegExp(q, "i");

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { username: searchPattern },
        { email: searchPattern },
        { fullName: searchPattern }
      ],
      isOnboarded: true
    })
    .select("_id username fullName profilePic nativeLanguage learningLanguage location bio")
    .limit(10);

    res.status(200).json({ 
      success: true, 
      users,
      count: users.length
    });
  } catch (error) {
    console.error("Error in searchUsers controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// ============= 👤 NEW FUNCTION 2: GET USER BY USERNAME =============
export async function getUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const cleanUsername = username.replace('@', '');

    const user = await User.findOne({ username: cleanUsername, isOnboarded: true })
      .select("_id username fullName profilePic bio nativeLanguage learningLanguage location friends");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const isFriend = user.friends.some(friendId => 
      friendId.toString() === req.user.id
    );

    let requestPending = false;
    let requestDirection = null;

    const pendingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user.id, recipient: user._id, status: "pending" },
        { sender: user._id, recipient: req.user.id, status: "pending" }
      ]
    });

    if (pendingRequest) {
      requestPending = true;
      requestDirection = pendingRequest.sender.toString() === req.user.id ? "sent" : "received";
    }

    res.status(200).json({ 
      success: true, 
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
        bio: user.bio,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        location: user.location,
        isFriend,
        requestPending,
        requestDirection
      }
    });
  } catch (error) {
    console.error("Error in getUserByUsername controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// ============= 💡 NEW FUNCTION 3: SUGGESTIONS (People You May Know) =============
export async function getSuggestions(req, res) {
  try {
    const currentUser = await User.findById(req.user.id)
      .select("friends nativeLanguage learningLanguage location");

    const friendIds = currentUser.friends.map(id => id.toString());
    friendIds.push(req.user.id);

    const suggestions = await User.aggregate([
      { 
        $match: { 
          _id: { $nin: friendIds.map(id => new mongoose.Types.ObjectId(id)) },
          isOnboarded: true
        } 
      },
      { 
        $addFields: {
          mutualFriendsCount: {
            $size: {
              $setIntersection: [
                "$friends",
                friendIds.map(id => new mongoose.Types.ObjectId(id))
              ]
            }
          },
          sameNativeLanguage: { $eq: ["$nativeLanguage", currentUser.nativeLanguage] },
          sameLearningLanguage: { $eq: ["$learningLanguage", currentUser.learningLanguage] },
          sameLocation: { $eq: ["$location", currentUser.location] }
        }
      },
      { 
        $match: { 
          $or: [
            { mutualFriendsCount: { $gt: 0 } },
            { sameNativeLanguage: true },
            { sameLearningLanguage: true }
          ]
        } 
      },
      { 
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$mutualFriendsCount", 10] },
              { $cond: ["$sameNativeLanguage", 5, 0] },
              { $cond: ["$sameLearningLanguage", 3, 0] },
              { $cond: ["$sameLocation", 2, 0] }
            ]
          }
        }
      },
      { $sort: { score: -1, mutualFriendsCount: -1 } },
      { $limit: 10 },
      { 
        $project: {
          _id: 1,
          username: 1,
          fullName: 1,
          profilePic: 1,
          nativeLanguage: 1,
          learningLanguage: 1,
          location: 1,
          bio: 1,
          mutualFriendsCount: 1,
          score: 1
        }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error("Error in getSuggestions controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}