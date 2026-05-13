/**
 * TokenManager - Handles Stream token lifecycle and automatic refresh
 * Features:
 * - Stores token with expiry time
 * - Checks if token is valid before use
 * - Automatically refreshes token before expiry
 * - Prevents multiple simultaneous refresh requests
 */

import { axiosInstance } from "./axios";

class StreamTokenManager {
  constructor() {
    this.token = null;
    this.expiresAt = null;
    this.userId = null;
    this.apiKey = null;
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  /**
   * Fetch a fresh token from backend
   */
  async fetchNewToken() {
    try {
      console.log("📡 Fetching new token from backend...");
      
      const response = await axiosInstance.get("/stream/token", {
        withCredentials: true,
      });
      
      if (!response.data?.token) {
        throw new Error("No token in response");
      }

      const { token, userId, apiKey, expiresAt } = response.data;
      
      // Update internal state
      this.token = token;
      this.userId = userId;
      this.apiKey = apiKey;
      this.expiresAt = expiresAt;
      
      console.log("✅ Token fetched successfully", {
        tokenLength: token.length,
        expiresIn: expiresAt ? (expiresAt - Math.floor(Date.now() / 1000)) : "unknown",
      });
      
      // Schedule next refresh (55 minutes, before token expires)
      this.scheduleRefresh();
      
      return { token, userId, apiKey, expiresAt };
    } catch (error) {
      console.error("❌ Failed to fetch token:", error.message);
      throw error;
    }
  }

  /**
   * Get current token - refresh if needed
   */
  async getToken() {
    // If token is valid, return it
    if (this.isTokenValid()) {
      console.log("✅ Using cached token");
      return {
        token: this.token,
        userId: this.userId,
        apiKey: this.apiKey,
        expiresAt: this.expiresAt,
      };
    }

    // If already refreshing, wait for it
    if (this.isRefreshing) {
      console.log("⏳ Token refresh in progress, waiting...");
      return this.refreshPromise;
    }

    // Refresh token
    return this.refresh();
  }

  /**
   * Force token refresh
   */
  async refresh() {
    // Prevent simultaneous refresh requests
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    
    this.refreshPromise = (async () => {
      try {
        const result = await this.fetchNewToken();
        this.isRefreshing = false;
        return result;
      } catch (error) {
        this.isRefreshing = false;
        throw error;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Check if current token is valid (with 5 minute buffer)
   */
  isTokenValid() {
    if (!this.token || !this.expiresAt) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const bufferSeconds = 5 * 60; // 5 minute buffer
    
    return this.expiresAt - now > bufferSeconds;
  }

  /**
   * Schedule token refresh before expiry
   */
  scheduleRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
    }

    if (!this.expiresAt) {
      console.warn("⚠️ Cannot schedule refresh: expiresAt not set");
      return;
    }

    // Refresh 55 minutes after getting token (5 minutes before 1-hour expiry)
    const refreshAfterMs = 55 * 60 * 1000;
    
    console.log("📅 Token refresh scheduled in 55 minutes");
    
    this.refreshInterval = setTimeout(() => {
      console.log("🔄 Initiating scheduled token refresh...");
      this.refresh().catch((error) => {
        console.error("❌ Scheduled refresh failed:", error);
      });
    }, refreshAfterMs);
  }

  /**
   * Cleanup - cancel scheduled refresh
   */
  destroy() {
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.token = null;
    this.expiresAt = null;
    this.userId = null;
    this.apiKey = null;
  }

  /**
   * Get token stats for debugging
   */
  getStats() {
    const now = Math.floor(Date.now() / 1000);
    return {
      hasToken: !!this.token,
      isValid: this.isTokenValid(),
      expiresIn: this.expiresAt ? (this.expiresAt - now) : null,
      isRefreshing: this.isRefreshing,
    };
  }
}

// Export singleton instance
export const tokenManager = new StreamTokenManager();
