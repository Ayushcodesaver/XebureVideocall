import { createContext, useContext, useEffect, useState, useRef } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const VideoClientContext = createContext(null);
export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const clientRef = useRef(null);
  const initializedRef = useRef(false);
  
  const { authUser, isLoading: authLoading } = useAuthUser();

  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser && !authLoading,
  });

  useEffect(() => {
    if (tokenError) {
      console.error("❌ Token error:", tokenError);
    }
  }, [tokenError]);

  useEffect(() => {
    // Don't initialize if already initialized
    if (initializedRef.current && clientRef.current) {
      console.log("✅ Video client already initialized, skipping...");
      return;
    }
    
    if (authLoading) return;
    if (!authUser) return;
    if (tokenLoading) return;
    if (!tokenData?.token) return;

    console.log("🎥 Creating StreamVideoClient (once)...");
    
    // Check if we already have a client to avoid duplicates
    if (clientRef.current) {
      console.log("Client already exists, reusing...");
      setVideoClient(clientRef.current);
      return;
    }
    
    try {
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
      initializedRef.current = true;
      
      // Wait for connection
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const state = client.wsConnection?.state;
        const userId = client.user?.id;
        
        console.log(`📡 Connection attempt ${attempts}:`, { state, userId });
        
        if (state === 'connected' && userId) {
          console.log("🎉 Video client connected successfully!");
          clearInterval(interval);
          setVideoClient(client);
          setIsReady(true);
          toast.success("Video ready!");
        } else if (attempts > 20) {
          console.warn("⚠️ Connection still not ready after 10 seconds");
          clearInterval(interval);
          setVideoClient(client); // Set anyway
        }
      }, 500);
      
      // Cleanup interval on unmount
      return () => {
        clearInterval(interval);
        // Don't disconnect here - let the client live
      };
      
    } catch (err) {
      console.error("❌ Client creation error:", err);
    }
  }, [authUser, authLoading, tokenData, tokenLoading]);

  // Cleanup only on complete unmount (not on re-renders)
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        console.log("🔌 Disconnecting video client on app unmount...");
        clientRef.current.disconnectUser();
        clientRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

 return (
  <VideoClientContext.Provider value={{ videoClient, isReady }}>
    {children}
  </VideoClientContext.Provider>
);
};