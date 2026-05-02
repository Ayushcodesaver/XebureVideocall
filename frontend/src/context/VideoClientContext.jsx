import { createContext, useContext, useEffect, useRef, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const VideoClientContext = createContext(null);

export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const initRef = useRef(false); // 🔥 prevent double init

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    // 🚫 stop duplicate init
    if (initRef.current) return;
    initRef.current = true;

    let client;

    const init = async () => {
      try {
        console.log("🚀 INIT VIDEO CLIENT");

        client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id.toString(),
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token: tokenData.token,
        });

        console.log("✅ CLIENT CREATED:", {
          userId: client.user?.id,
        });

        setVideoClient(client);
      } catch (err) {
        console.error("❌ INIT FAILED:", err);
        initRef.current = false;
      }
    };

    init();

    return () => {
      if (client) {
        console.log("🔌 disconnecting...");
        client.disconnectUser();
      }
    };
  }, [authUser, tokenData]);

  return (
    <VideoClientContext.Provider value={{ videoClient }}>
      {children}
    </VideoClientContext.Provider>
  );
};