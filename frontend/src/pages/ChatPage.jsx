import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { Mic, Paperclip, Send, RefreshCw, WifiOff, Phone, PhoneOff } from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";
import FileUploader from "../components/FileUploader";
import GifPicker from "../components/GifPicker";
import MediaViewer from "../components/MediaViewer";
import { useVideoClient } from "../context/VideoClientContext";

import {
  Channel,
  ChannelHeader,
  Chat,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { Video, MoreVertical, Sparkles } from "lucide-react";
import VoiceMessageBubble from '../components/VoiceMessageBubble';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  
  // ✅ Only take videoClient
  const { videoClient } = useVideoClient();
  
  // ✅ Ref for live value (fixes stale closure issue)
  const videoClientRef = useRef(null);
  
  const ringtoneRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const isConnecting = useRef(false);
  const isReconnecting = useRef(false);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Keep ref updated with latest videoClient
  useEffect(() => {
    videoClientRef.current = videoClient;
    console.log("📹 Video client ref updated:", !!videoClient);
  }, [videoClient]);

  // ✅ Fixed wait function - reads from REF, not closure
  const waitForVideoClient = useCallback(() => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds max (200ms * 50)

      // ✅ Read from ref for LIVE value (fixes stale closure)
      if (videoClientRef.current) {
        console.log("✅ Video client already ready (from ref)");
        resolve(true);
        return;
      }

      console.log("⏳ Waiting for video client to initialize...");
      
      const interval = setInterval(() => {
        attempts++;
        
        // ✅ Always reads CURRENT value via ref
        if (videoClientRef.current) {
          console.log(`✅ Video client ready after ${attempts * 200}ms`);
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error(`❌ Video client timeout after ${maxAttempts * 200}ms`);
          reject(new Error("Video client initialization timeout"));
        }
      }, 200);
    });
  }, []); // ✅ Empty dependency - ref handles live updates

  // Stop ringtone function
  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
  }, []);

  // Play ringtone function
  const playRingtone = useCallback(() => {
    try {
      stopRingtone();
      ringtoneRef.current = new Audio("/ringtone.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(() => console.log("Audio play failed"));
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  }, [stopRingtone]);

  // ✅ FIXED: Listen for incoming calls - Use videoClient directly for reliability
  useEffect(() => {
    if (!videoClient) return;

    console.log("🎧 Setting up call listeners...");
    
    const handleCallRinging = (e) => {
      console.log('Call ringing:', e);
      const call = e.call;
      if (call && call.id) {
        setIncomingCall({
          id: call.id,
          caller: call.createdBy || { name: authUser?.fullName || "Someone" },
          timestamp: new Date(),
        });
        playRingtone();
        toast.success(`Incoming call!`, { duration: 30000, icon: "📞" });
      }
    };

    videoClient.on('call.ringing', handleCallRinging);
    
    return () => {
      videoClient.off('call.ringing', handleCallRinging);
      stopRingtone();
    };
  }, [videoClient, authUser, playRingtone, stopRingtone]);

  // ✅ FIXED: Accept call handler - Navigate FIRST, then join (WhatsApp style)
  const acceptCall = async () => {
    stopRingtone();
    const client = videoClientRef.current;
    
    if (incomingCall && client) {
      try {
        const call = client.call("default", incomingCall.id);
        
        // ✅ FIRST: Navigate to call screen (instant UI)
        navigate(`/call/${incomingCall.id}`);
        
        // ✅ THEN: Join in background (WhatsApp style)
        if (!call.state?.joined) {
          call.join().catch(() => {
            toast.error("Failed to join call");
          });
        }
        
        setIncomingCall(null);
      } catch (error) {
        console.error("Error accepting call:", error);
        toast.error("Failed to accept call");
      }
    }
  };

  // ✅ FIXED: Reject call handler using REF
  const rejectCall = async () => {
    stopRingtone();
    const client = videoClientRef.current;
    
    if (incomingCall && client) {
      try {
        const call = client.call("default", incomingCall.id);
        await call.reject();
        toast.success("Call rejected");
      } catch (error) {
        console.error("Error rejecting call:", error);
      }
    }
    setIncomingCall(null);
  };

  const reconnectChat = async () => {
    if (isReconnecting.current || isConnecting.current) return;
    if (!authUser || !targetUserId || !tokenData?.token) return;
    
    isReconnecting.current = true;
    isConnecting.current = true;
    
    toast.loading("Reconnecting to chat...", { id: "reconnect" });
    
    try {
      if (chatClient) {
        await chatClient.disconnectUser();
      }
      
      const client = StreamChat.getInstance(STREAM_API_KEY);
      await client.connectUser(
        {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        tokenData.token
      );
      
      const sortedIds = [authUser._id, targetUserId].sort();
      const channelId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
      
      const currChannel = client.channel("messaging", channelId, {
        members: [authUser._id, targetUserId],
        name: `Chat between ${authUser.fullName} and friend`,
      });
      
      await currChannel.watch();
      
      setChatClient(client);
      setChannel(currChannel);
      setMessages([...currChannel.state.messages]);
      setIsConnected(true);
      toast.success("Reconnected successfully!", { id: "reconnect" });
    } catch (error) {
      console.error("Reconnection error:", error);
      toast.error("Failed to reconnect. Please refresh the page.", { id: "reconnect" });
      setIsConnected(false);
    } finally {
      isReconnecting.current = false;
      isConnecting.current = false;
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (isConnecting.current) return;
      if (!tokenData?.token || !authUser || !targetUserId) return;

      if (authUser._id === targetUserId) {
        toast.error("You cannot chat with yourself");
        setLoading(false);
        return;
      }

      isConnecting.current = true;

      try {
        console.log("Initializing stream chat client for Xebure...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const sortedIds = [authUser._id, targetUserId].sort();
        const channelId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
        
        console.log("Channel ID:", channelId);

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
          name: `Chat between ${authUser.fullName} and friend`,
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
        setMessages([...currChannel.state.messages]);
        setIsConnected(true);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
        setIsConnected(false);
      } finally {
        setLoading(false);
        isConnecting.current = false;
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [tokenData, authUser, targetUserId]);

  // Listen for new messages
  useEffect(() => {
    if (!channel) return;
    
    const handleNewMessage = () => {
      setMessages([...channel.state.messages]);
    };
    
    const handleMessageDeleted = () => {
      setMessages([...channel.state.messages]);
    };
    
    channel.on('message.new', handleNewMessage);
    channel.on('message.deleted', handleMessageDeleted);
    
    return () => {
      channel.off('message.new', handleNewMessage);
      channel.off('message.deleted', handleMessageDeleted);
    };
  }, [channel]);

  // ✅ FIXED: Connection check with proper cleanup
  useEffect(() => {
    if (!chatClient) return;
    
    let interval;
    
    interval = setInterval(() => {
      const connected = chatClient && chatClient.user;
      if (isConnected !== connected) {
        setIsConnected(connected);
        if (!connected) {
          toast.error("Connection lost! Click reconnect button.", { id: "connection-lost" });
        }
      }
    }, 3000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatClient, isConnected]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          if (chatClient && !chatClient.user && !isReconnecting.current) {
            reconnectChat();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [chatClient]);

  // ✅ FIXED: Video call handler - NO members, NO join
  const handleVideoCall = async () => {
    if (!channel || !authUser || !tokenData?.token) {
      toast.error("Not connected. Please reconnect first.");
      return;
    }

    if (isJoiningCall) return;
    
    setIsJoiningCall(true);
    
    try {
      toast.loading("Preparing call...", { id: "call" });
      
      await waitForVideoClient();
      
      const client = videoClientRef.current;
      const callId = `call_${channel.id}`;
      const call = client.call("default", callId);
      
      // ✅ REMOVED members array - Stream auto handles
      await call.getOrCreate({
        data: {
          created_by_id: authUser._id,
        },
        ringing: { timeout: 30000 }
      });
      
      toast.dismiss("call");
      navigate(`/call/${callId}`);
      
      // ✅ REMOVED call.join() - CallPage handles join
      
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error(error.message || "Failed to start video call");
      toast.dismiss("call");
    } finally {
      setIsJoiningCall(false);
    }
  };

  // ✅ FIXED: Audio call handler - NO members, NO join
  const handleAudioCall = async () => {
    if (!channel || !authUser || !tokenData?.token) {
      toast.error("Not connected. Please reconnect first.");
      return;
    }

    if (isJoiningCall) return;
    
    setIsJoiningCall(true);
    
    try {
      toast.loading("Preparing call...", { id: "call" });
      
      await waitForVideoClient();
      
      const client = videoClientRef.current;
      const callId = `audio_${channel.id}`;
      const call = client.call("default", callId);
      
      // ✅ REMOVED members array - Stream auto handles
      await call.getOrCreate({
        data: {
          created_by_id: authUser._id,
        },
        settings_override: {
          video: { enabled: false },
          audio: { enabled: true }
        },
        ringing: { timeout: 30000 }
      });
      
      toast.dismiss("call");
      navigate(`/call/${callId}?type=audio`);
      
      // ✅ REMOVED call.join() - CallPage handles join
      
    } catch (error) {
      console.error("Error starting audio call:", error);
      toast.error(error.message || "Failed to start audio call");
      toast.dismiss("call");
    } finally {
      setIsJoiningCall(false);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    if (channel && isConnected) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          await channel.sendMessage({
            text: "",
            attachments: [{
              type: "audio",
              asset_url: reader.result,
              title: "Voice message",
              mime_type: "audio/webm",
              file_size: audioBlob.size
            }]
          });
          toast.success("Voice message sent!");
        };
        reader.readAsDataURL(audioBlob);
        setShowVoiceRecorder(false);
      } catch (error) {
        console.error("Error sending voice message:", error);
        toast.error("Failed to send voice message");
      }
    } else {
      toast.error("Not connected. Please reconnect first.");
    }
  };

  const handleCancelVoice = () => setShowVoiceRecorder(false);
  const handleCancelFileUpload = () => setShowFileUploader(false);
  const handleCancelGifPicker = () => setShowGifPicker(false);

  const handleFileUpload = (fileData) => {
    if (channel && isConnected) {
      const fileType = fileData.type.split('/')[0];
      channel.sendMessage({
        text: "",
        attachments: [{
          type: fileType,
          asset_url: fileData.url,
          title: fileData.name,
          mime_type: fileData.type,
          file_size: fileData.size
        }]
      });
      toast.success(`${fileData.name} sent!`);
    } else {
      toast.error("Not connected. Please reconnect first.");
    }
    setShowFileUploader(false);
  };

  const handleGifSelect = async (gifUrl) => {
    if (channel && isConnected) {
      try {
        await channel.sendMessage({
          text: "",
          attachments: [{
            type: "image",
            mime_type: "image/gif",
            asset_url: gifUrl,
            title: "GIF",
          }]
        });
        toast.success("GIF sent!");
      } catch (error) {
        console.error("Error sending GIF:", error);
        toast.error("Failed to send GIF. Please try again.");
      }
    } else {
      toast.error("Not connected. Please reconnect first.");
    }
    setShowGifPicker(false);
  };

  const handleMediaClick = (attachments, index) => {
    const mediaList = attachments.map(att => {
      const isImage = att.type === 'image' || 
                      att.type?.startsWith('image/') || 
                      att.mime_type === 'image/gif' ||
                      att.asset_url?.includes('.gif') ||
                      att.asset_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
      
      return {
        url: att.asset_url,
        type: isImage ? 'image' : 'video'
      };
    });
    setCurrentMedia(mediaList);
    setCurrentMediaIndex(index);
    setMediaViewerOpen(true);
  };

  // Improved enter key handler - Shift+Enter = new line, Enter = send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const sendTextMessage = async () => {
    if (customInputValue.trim() && channel && isConnected) {
      await channel.sendMessage({ text: customInputValue });
      setCustomInputValue('');
    } else if (!isConnected) {
      toast.error("Not connected. Please reconnect first.");
    }
  };

  // Custom message renderer function
  const renderCustomMessage = (message) => {
    const isMyMessage = message.user?.id === authUser?._id;
    
    if (message.attachments && message.attachments.length > 0) {
      return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2 px-2`}>
          <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} rounded-2xl px-3 py-2`}>
            {message.attachments.map((attachment, idx) => {
              if (attachment.type === "image" || 
                  attachment.type?.startsWith('image/') || 
                  attachment.mime_type === "image/gif" ||
                  attachment.asset_url?.includes('.gif')) {
                return (
                  <button
                    key={idx}
                    onClick={() => handleMediaClick(message.attachments, idx)}
                    className="block max-w-[200px] rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <img 
                      src={attachment.asset_url} 
                      alt={attachment.title || "GIF"}
                      className="w-full h-auto"
                    />
                  </button>
                );
              }
              if (attachment.type === "video" || attachment.type?.startsWith('video/')) {
                return (
                  <button
                    key={idx}
                    onClick={() => handleMediaClick(message.attachments, idx)}
                    className="relative max-w-[200px] rounded-lg overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <video 
                      src={attachment.asset_url} 
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </button>
                );
              }
              if (attachment.type === "audio") {
                return (
                  <VoiceMessageBubble 
                    key={idx} 
                    audioUrl={attachment.asset_url} 
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    
    if (message.text && message.text.trim()) {
      return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2 px-2`}>
          <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} rounded-2xl px-3 py-2`}>
            <p className="text-sm break-words">{message.text}</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loading) return <ChatLoader />;

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="bg-base-200/95 backdrop-blur-md border-b border-base-300 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="/xebure-logo.png" 
              alt="Xebure" 
              className="w-8 h-8 object-contain rounded-lg"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=32"; }}
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Xebure Chat</h1>
            </div>
          </div>
          
          <div className="h-6 w-px bg-base-300 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <div className={`relative ${!isConnected ? 'opacity-50' : ''}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs ml-2 hidden sm:inline text-base-content/60">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isConnected && (
            <button onClick={reconnectChat} disabled={isReconnecting.current} className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all duration-300" title="Reconnect chat">
              <RefreshCw className={`w-5 h-5 ${isReconnecting.current ? "animate-spin" : ""}`} />
            </button>
          )}
          
          {/* ✅ Audio Call Button - ONLY check videoClient */}
          <button 
            onClick={handleAudioCall} 
            disabled={!videoClient || isJoiningCall}
            className={`relative group p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
              !videoClient || isJoiningCall
                ? "opacity-50 cursor-not-allowed bg-gray-500" 
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105"
            } text-white`}
            title="Start Audio Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          
          {/* ✅ Video Call Button - ONLY check videoClient */}
          <button 
            onClick={handleVideoCall} 
            disabled={!videoClient || isJoiningCall}
            className={`relative group p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
              !videoClient || isJoiningCall
                ? "opacity-50 cursor-not-allowed bg-gray-500" 
                : "bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary transform hover:scale-105"
            } text-white`}
            title="Start Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-base-300 transition-colors">
            <MoreVertical className="w-5 h-5 text-base-content/60" />
          </button>
        </div>
      </div>
      
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-base-100 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-base-300">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-base-content mb-2">Incoming Call</h2>
              <p className="text-base-content/70 mb-6">{incomingCall.caller?.name || "Someone"} is calling you...</p>
              <div className="flex gap-4 justify-center">
                <button onClick={acceptCall} className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Accept
                </button>
                <button onClick={rejectCall} className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                  <PhoneOff className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-base-100">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-base-content">Disconnected</h3>
            <p className="text-base-content/60 text-center max-w-sm">You've been disconnected from the chat. Click the button below to reconnect.</p>
            <button onClick={reconnectChat} disabled={isReconnecting.current} className="px-6 py-2 bg-primary text-primary-content rounded-xl font-semibold hover:bg-primary-focus transition-all flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 ${isReconnecting.current ? "animate-spin" : ""}`} />
              {isReconnecting.current ? "Reconnecting..." : "Reconnect to Chat"}
            </button>
          </div>
        ) : (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="flex flex-col flex-1 min-h-0">
                <CallButton handleVideoCall={handleVideoCall} handleAudioCall={handleAudioCall} />
                
                <Window className="flex flex-col flex-1 min-h-0">
                  <ChannelHeader className="flex-shrink-0" />
                  
                  {/* Smooth custom message rendering with auto-scroll */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((message, idx) => (
                      <div key={message.id || idx}>
                        {renderCustomMessage(message)}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="str-chat__message-input border-t border-base-300 bg-base-100 flex-shrink-0">
                    {showVoiceRecorder && (
                      <div className="mb-2">
                        <VoiceRecorder onSend={handleVoiceMessage} onCancel={handleCancelVoice} />
                      </div>
                    )}
                    {showFileUploader && (
                      <div className="mb-2">
                        <FileUploader onUpload={handleFileUpload} onCancel={handleCancelFileUpload} />
                      </div>
                    )}
                    {showGifPicker && (
                      <div className="mb-2">
                        <GifPicker onSelect={handleGifSelect} onCancel={handleCancelGifPicker} />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 bg-base-100 rounded-xl border border-base-300 p-2">
                      <button onClick={() => { setShowFileUploader(!showFileUploader); setShowGifPicker(false); setShowVoiceRecorder(false); }} className="p-2 rounded-full hover:bg-base-200 transition-colors" title="Attach file">
                        <Paperclip className="w-5 h-5 text-base-content/60 hover:text-primary transition-colors" />
                      </button>
                      <button onClick={() => { setShowGifPicker(!showGifPicker); setShowFileUploader(false); setShowVoiceRecorder(false); }} className="p-2 rounded-full hover:bg-base-200 transition-colors" title="Add GIF">
                        <svg className="w-5 h-5 text-base-content/60 hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M8 12h8M12 8v8" />
                        </svg>
                      </button>
                      <button onClick={() => setShowVoiceRecorder(!showVoiceRecorder)} className={`p-2 rounded-full transition-all duration-300 ${showVoiceRecorder ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/60 hover:text-primary"}`} title="Record voice message">
                        <Mic className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={customInputValue}
                        onChange={(e) => setCustomInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent outline-none text-base-content py-2 px-2"
                      />
                      <button className={`p-2 rounded-full transition-all duration-300 ${customInputValue.trim() && isConnected ? "bg-primary text-primary-content hover:bg-primary-focus" : "bg-base-200 text-base-content/40 cursor-not-allowed"}`} disabled={!customInputValue.trim() || !isConnected} onClick={sendTextMessage}>
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Window>
                
                <div className="hidden">
                  <Thread />
                </div>
              </div>
            </Channel>
          </Chat>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-base-200/80 backdrop-blur-sm border-t border-base-300 px-4 py-2 text-center flex-shrink-0">
        <p className="text-xs text-base-content/40 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">End-to-end encrypted •</span>
          Powered by Xebure Premium
        </p>
      </div>

      {/* Media Viewer Modal */}
      {mediaViewerOpen && (
        <MediaViewer media={currentMedia} onClose={() => setMediaViewerOpen(false)} initialIndex={currentMediaIndex} />
      )}
    </div>
  );
};

export default ChatPage;