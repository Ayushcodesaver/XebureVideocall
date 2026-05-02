import { createContext, useContext, useEffect, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-client"; // 🔥 FIX
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const VideoClientContext = createContext(null);

export const useVideoClient = () => useContext(VideoClientContext);

export const VideoClientProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState(null);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) {
      console.log("⛔ Waiting for authUser or token...");
      return;
    }

    let client;

    const init = async () => {
      try {
        console.log("🚀 INIT VIDEO CLIENT");

        client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
        });

        await client.connectUser(
          {
            id: authUser._id.toString(),
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        console.log("✅ CONNECTED SUCCESS:", {
          userId: client.user?.id,
          ws: client.wsConnection?.state,
        });

        setVideoClient(client);
      } catch (err) {
        console.error("❌ CONNECT USER FAILED:", err);
      }
    };

    init();

    return () => {
      if (client) {
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