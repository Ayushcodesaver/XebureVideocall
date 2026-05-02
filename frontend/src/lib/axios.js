import axios from "axios";

// ✅ Dynamic base URL
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

// ✅ Axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔥 VERY IMPORTANT (cookies for auth)
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Optional: Debug request (remove later)
axiosInstance.interceptors.request.use((config) => {
  console.log("📡 API Request:", config.method?.toUpperCase(), config.url);
  return config;
});

// ✅ Optional: Debug response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Don't log 401 errors for auth check (it's normal when logged out)
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    if (!(error.response?.status === 401 && isAuthCheck)) {
      console.error("❌ API Error:", error?.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);