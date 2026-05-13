import { axiosInstance } from "./axios";

// ---------------- AUTH ----------------

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

// ---------------- USERS ----------------

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

// ---------------- STREAM (FIXED WITH DEBUG) ----------------

export async function getStreamToken() {
  try {
    console.log("📡 Frontend: Requesting token from /stream/token...");
    
    const response = await axiosInstance.get("/stream/token", {
      withCredentials: true,
    });
    
    console.log("✅ Frontend: Token response received:", {
      status: response.status,
      hasToken: !!response.data?.token,
      tokenLength: response.data?.token?.length,
      userId: response.data?.userId,
      apiKey: response.data?.apiKey
    });
    
    if (!response.data?.token) {
      console.error("❌ No token in response!", response.data);
      throw new Error("No token received from server");
    }
    
    return response.data;
  } catch (error) {
    console.error("❌ Frontend: getStreamToken failed:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
}

// ---------------- EXTRA ----------------

export async function removeFriend(friendId) {
  const response = await axiosInstance.delete(`/users/friends/${friendId}`);
  return response.data;
}