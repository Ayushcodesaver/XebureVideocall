import { createContext, useContext, useEffect, useState, useRef } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const VideoClientContext = createContext(null);
export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const clientRef = useRef(null);
  const { authUser, isLoading: authLoading } = useAuthUser();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser && !authLoading,
  });

  useEffect(() => {
    if (authLoading || !authUser || tokenLoading || !tokenData?.token) {
      return;
    }

    if (clientRef.current) {
      if (!videoClient) setVideoClient(clientRef.current);
      return;
    }

    try {
      console.log("🎥 Creating StreamVideoClient...");
      const client = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        token: tokenData.token,
        user: {
          id: String(authUser._id),
          name: authUser.fullName,
          image: authUser.profilePic || "",
        },
      });
      
      clientRef.current = client;
      setVideoClient(client);
      console.log("✅ Video client created and stored in state");
    } catch (err) {
      console.error("❌ Client creation failed:", err);
    }
  }, [authUser, authLoading, tokenData, tokenLoading, videoClient]);

  useEffect(() => {
    if (clientRef.current && !videoClient) {
      setVideoClient(clientRef.current);
    }
  }, [videoClient]);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
      }
    };
  }, []);

  return (
    <VideoClientContext.Provider value={{ videoClient: clientRef.current || videoClient }}>
      {children}
    </VideoClientContext.Provider>
  );
};