import { createContext, useContext, useRef, useEffect, useState } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const VideoClientContext = createContext(null);

export const useVideoClient = () => {
  const context = useContext(VideoClientContext);
  if (!context) {
    throw new Error('useVideoClient must be used within VideoClientProvider');
  }
  return context;
};

export const VideoClientProvider = ({ children }) => {
  const videoClientRef = useRef(null);
  const [videoClient, setVideoClient] = useState(null); // ✅ State for reactivity
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    // ✅ prevent multiple instances
    if (videoClientRef.current) return;

    console.log("✅ Creating SINGLE video client...");

    const client = new StreamVideoClient({
      apiKey: STREAM_API_KEY,
      user: {
        id: authUser._id,
        name: authUser.fullName,
        image: authUser.profilePic,
      },
      token: tokenData.token,
    });

    videoClientRef.current = client;
    setVideoClient(client); // ✅ Update state for reactivity

    return () => {
      // ✅ Cleanup only on unmount, not on every re-render
      // Disconnect will be handled by disconnectVideoClient on logout
    };
  }, [tokenData, authUser]);

  const disconnectVideoClient = async () => {
    if (videoClientRef.current) {
      console.log("🔌 Disconnecting video client...");
      await videoClientRef.current.disconnectUser();
      videoClientRef.current = null;
      setVideoClient(null); // ✅ Clear state
    }
  };

  return (
    <VideoClientContext.Provider value={{ videoClient: videoClient || videoClientRef.current, disconnectVideoClient }}>
      {children}
    </VideoClientContext.Provider>
  );
};