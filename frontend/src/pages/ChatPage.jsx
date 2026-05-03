import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { Mic, Paperclip, Send, RefreshCw, WifiOff, Phone, PhoneOff, Video, MoreVertical, Sparkles } from "lucide-react";
import VoiceRecorder from "../components/VoiceRecorder";
import FileUploader from "../components/FileUploader";
import GifPicker from "../components/GifPicker";
import MediaViewer from "../components/MediaViewer";
import { useVideoClient } from "../context/VideoClientContext";
import { useEncryptionContext } from "../context/EncryptionContext";

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
import VoiceMessageBubble from '../components/VoiceMessageBubble';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  
  const { videoClient } = useVideoClient();
  const { encryptForUser, decryptFromUser, isReady: encryptionReady } = useEncryptionContext();
  const videoClientRef = useRef(null);
  
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
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const isConnecting = useRef(false);
  const isReconnecting = useRef(false);

  const { authUser } = useAuthUser();

  useEffect(() => {
    if (authUser) {
      console.log("👤 FRONTEND AUTH USER ID:", authUser._id);
    }
  }, [authUser]);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    videoClientRef.current = videoClient;
    console.log("📹 Video client ref updated:", !!videoClient);
  }, [videoClient]);

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
          id: authUser._id.toString(),
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        tokenData.token
      );
      
      const sortedIds = [authUser._id.toString(), targetUserId.toString()].sort();
      const channelId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
      
      const currChannel = client.channel("messaging", channelId, {
        members: [authUser._id.toString(), targetUserId.toString()],
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
            id: authUser._id.toString(),
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const sortedIds = [authUser._id.toString(), targetUserId.toString()].sort();
        const channelId = `chat_${sortedIds[0]}_${sortedIds[1]}`;
        
        console.log("Channel ID:", channelId);

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id.toString(), targetUserId.toString()],
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

  useEffect(() => {
    if (!channel) return;

    const updateMessages = () => {
      const latestMessages = [...channel.state.messages];
      console.log("🔄 Syncing messages, count:", latestMessages.length);
      setMessages(latestMessages);
    };

    updateMessages();

    channel.on('message.new', updateMessages);
    channel.on('message.deleted', updateMessages);
    channel.on('message.updated', updateMessages);

    return () => {
      channel.off('message.new', updateMessages);
      channel.off('message.deleted', updateMessages);
      channel.off('message.updated', updateMessages);
    };
  }, [channel]);

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

  // 🔥 LINK-BASED VIDEO CALL HANDLER
  const handleVideoCall = async () => {
    if (!channel || !authUser || !tokenData?.token) {
      toast.error("Not connected. Please reconnect first.");
      return;
    }

    if (isJoiningCall) return;
    
    setIsJoiningCall(true);
    
    try {
      toast.loading("Creating video call link...", { id: "call" });
      
      const client = videoClientRef.current;
      if (!client) {
        toast.error("Video client not ready");
        toast.dismiss("call");
        return;
      }
      
      // ✅ Short call ID (max 64 characters)
      const callId = `vc_${Date.now()}`;
      const call = client.call("default", callId);
      
      await call.getOrCreate({
        data: {
          created_by_id: authUser._id.toString(),
          created_by_name: authUser.fullName,
        },
      });
      
      const callLink = `${window.location.origin}/call/${callId}`;
      
      await channel.sendMessage({
        text: `📹 **${authUser.fullName} started a video call!**\n\n🔗 Join link: ${callLink}\n\n⏰ This link expires in 1 hour.`
      });
      
      console.log("🔗 Video call link created:", callLink);
      toast.dismiss("call");
      toast.success("Video call link sent in chat!");
      
      navigate(`/call/${callId}?type=video`);
      
    } catch (error) {
      console.error("Error creating video call:", error);
      toast.error(error.message || "Failed to create video call");
      toast.dismiss("call");
    } finally {
      setIsJoiningCall(false);
    }
  };

  // 🔥 LINK-BASED AUDIO CALL HANDLER
  const handleAudioCall = async () => {
    if (!channel || !authUser || !tokenData?.token) {
      toast.error("Not connected. Please reconnect first.");
      return;
    }

    if (isJoiningCall) return;
    
    setIsJoiningCall(true);
    
    try {
      toast.loading("Creating audio call link...", { id: "call" });
      
      const client = videoClientRef.current;
      if (!client) {
        toast.error("Video client not ready");
        toast.dismiss("call");
        return;
      }
      
      // ✅ Short call ID (max 64 characters)
      const callId = `ac_${Date.now()}`;
      const call = client.call("default", callId);
      
      await call.getOrCreate({
        data: {
          created_by_id: authUser._id.toString(),
          created_by_name: authUser.fullName,
        },
        settings_override: {
          video: { enabled: false },
          audio: { enabled: true }
        }
      });
      
      const callLink = `${window.location.origin}/call/${callId}?type=audio`;
      
      await channel.sendMessage({
        text: `🎵 **${authUser.fullName} started an audio call!**\n\n🔗 Join link: ${callLink}\n\n⏰ This link expires in 1 hour.`
      });
      
      console.log("🔗 Audio call link created:", callLink);
      toast.dismiss("call");
      toast.success("Audio call link sent in chat!");
      
      navigate(`/call/${callId}?type=audio`);
      
    } catch (error) {
      console.error("Error creating audio call:", error);
      toast.error(error.message || "Failed to create audio call");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const sendTextMessage = async () => {
    if (customInputValue.trim() && channel && isConnected) {
      try {
        let messageToSend = customInputValue;
        let encryptionData = null;
        
        // Encrypt message if encryption is ready
        if (encryptionReady && encryptForUser) {
          const encrypted = encryptForUser(customInputValue, targetUserId);
          messageToSend = encrypted.content;
          encryptionData = {
            encrypted: true,
            iv: encrypted.iv,
            hash: encrypted.hash
          };
        }
        
        await channel.sendMessage({
          text: messageToSend,
          ...encryptionData
        });
        setCustomInputValue('');
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    } else if (!isConnected) {
      toast.error("Not connected. Please reconnect first.");
    }
  };

  // 🔥 Message renderer with beautiful call link cards
  const renderCustomMessage = (message) => {
    const isMyMessage = message.user?.id === authUser?._id;
    let text = message.text || "";
    
    // Decrypt message if it's encrypted
    if (!isMyMessage && message.encrypted && decryptFromUser && encryptionReady) {
      try {
        text = decryptFromUser({
          content: message.text,
          iv: message.iv,
          hash: message.hash,
          encrypted: true
        }, message.user.id);
      } catch (error) {
        console.error("Error decrypting message:", error);
        text = "[Failed to decrypt message]";
      }
    }
    
    // Check for call links
    const isVideoCall = text.includes("started a video call!");
    const isAudioCall = text.includes("started an audio call!");
    const isCallLink = isVideoCall || isAudioCall;
    
    if (isCallLink) {
      const linkMatch = text.match(/https?:\/\/[^\s]+/);
      const callLink = linkMatch ? linkMatch[0] : "";
      
      return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3 px-2`}>
          <div className={`max-w-[85%] rounded-2xl overflow-hidden shadow-xl border-2 ${isVideoCall ? 'border-green-500/50' : 'border-blue-500/50'} bg-base-200`}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isVideoCall ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                  {isVideoCall ? (
                    <Video className="w-6 h-6 text-green-500" />
                  ) : (
                    <Phone className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-base-content">{isVideoCall ? "📹 Video Call" : "🎵 Audio Call"}</p>
                  <p className="text-xs text-base-content/60">Click to join</p>
                </div>
              </div>
              
              <button
  onClick={() => {
    window.location.href = callLink;
  }}
  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
>
  {/* Animated gradient border */}
  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  
  {/* Button content */}
  <div className="relative px-6 py-3 flex items-center justify-center gap-3">
    <div className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </div>
    <span className="text-white font-bold text-base tracking-wide">Join Call</span>
    <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  </div>
</button>
              
              <p className="text-xs text-base-content/40 mt-3 text-center">
                ⏰ Link valid for 1 hour
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Handle attachments
    if (message.attachments && message.attachments.length > 0) {
      return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2 px-2`}>
          <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} rounded-2xl px-3 py-2`}>
            {message.attachments.map((attachment, idx) => {
              if (attachment.type === "image" || attachment.type?.startsWith('image/')) {
                return (
                  <button key={idx} onClick={() => handleMediaClick(message.attachments, idx)} className="block max-w-[200px] rounded-lg overflow-hidden">
                    <img src={attachment.asset_url} alt="" className="w-full h-auto" />
                  </button>
                );
              }
              if (attachment.type === "audio") {
                return <VoiceMessageBubble key={idx} audioUrl={attachment.asset_url} />;
              }
              return null;
            })}
          </div>
        </div>
      );
    }
    
    // Normal text message
    if (text && text.trim()) {
      return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2 px-2`}>
          <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'} rounded-2xl px-4 py-2`}>
            <p className="text-sm break-words">{text}</p>
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
            <img src="/xebure-logo.png" alt="Xebure" className="w-8 h-8 object-contain rounded-lg" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Xebure Chat</h1>
            </div>
          </div>
          
          <div className="h-6 w-px bg-base-300 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs ml-2 hidden sm:inline text-base-content/60">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isConnected && (
            <button onClick={reconnectChat} disabled={isReconnecting.current} className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all">
              <RefreshCw className={`w-5 h-5 ${isReconnecting.current ? "animate-spin" : ""}`} />
            </button>
          )}
          
          <button onClick={handleAudioCall} disabled={!videoClient || isJoiningCall} className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 transition-all">
            <Phone className="w-5 h-5" />
          </button>
          
          <button onClick={handleVideoCall} disabled={!videoClient || isJoiningCall} className="p-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white transform hover:scale-105 transition-all">
            <Video className="w-5 h-5" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-base-300 transition-colors">
            <MoreVertical className="w-5 h-5 text-base-content/60" />
          </button>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-base-100">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-base-content">Disconnected</h3>
            <p className="text-base-content/60 text-center max-w-sm">You've been disconnected from the chat. Click the button below to reconnect.</p>
            <button onClick={reconnectChat} disabled={isReconnecting.current} className="px-6 py-2 bg-primary text-primary-content rounded-xl font-semibold hover:bg-primary-focus transition-all">
              <RefreshCw className={`w-5 h-5 ${isReconnecting.current ? "animate-spin" : ""}`} />
              {isReconnecting.current ? "Reconnecting..." : "Reconnect to Chat"}
            </button>
          </div>
        ) : (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="flex flex-col flex-1 min-h-0">
                <Window className="flex flex-col flex-1 min-h-0">
                  <ChannelHeader className="flex-shrink-0" />
                  
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
                      <button onClick={() => { setShowFileUploader(!showFileUploader); setShowGifPicker(false); setShowVoiceRecorder(false); }} className="p-2 rounded-full hover:bg-base-200 transition-colors">
                        <Paperclip className="w-5 h-5 text-base-content/60" />
                      </button>
                      <button onClick={() => { setShowGifPicker(!showGifPicker); setShowFileUploader(false); setShowVoiceRecorder(false); }} className="p-2 rounded-full hover:bg-base-200 transition-colors">
                        <svg className="w-5 h-5 text-base-content/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="M8 12h8M12 8v8" />
                        </svg>
                      </button>
                      <button onClick={() => setShowVoiceRecorder(!showVoiceRecorder)} className={`p-2 rounded-full transition-all ${showVoiceRecorder ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/60"}`}>
                        <Mic className="w-5 h-5" />
                      </button>
                      <input type="text" value={customInputValue} onChange={(e) => setCustomInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-base-content py-2 px-2" />
                      <button className={`p-2 rounded-full transition-all ${customInputValue.trim() && isConnected ? "bg-primary text-primary-content hover:bg-primary-focus" : "bg-base-200 text-base-content/40 cursor-not-allowed"}`} disabled={!customInputValue.trim() || !isConnected} onClick={sendTextMessage}>
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Window>
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