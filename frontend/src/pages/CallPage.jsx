import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useVideoClient } from "../context/VideoClientContext";

import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { 
  PhoneOff, 
  Users, 
  Crown, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  MonitorUp,
  MonitorDown,
  Settings,
  Volume2,
  VolumeX,
  X,
  Phone,
  Check,
} from "lucide-react";

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { videoClient } = useVideoClient();
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMics, setAvailableMics] = useState([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [isRinging, setIsRinging] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  
  // Refs for cleanup
  const timerRef = useRef(null);
  const callInstanceRef = useRef(null);
  const isUserEndingCallRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const timerStartedRef = useRef(false);
  const waitingRingtoneRef = useRef(null);

  const { authUser, isLoading } = useAuthUser();

  // Call state
  const isMuted = call?.microphone?.state?.muted === true;
  const isVideoOff = call?.camera?.state?.enabled === false;
  const isScreenSharingSync = call?.screenShare?.state?.enabled === true;

  // Get devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const mics = devices.filter(device => device.kind === 'audioinput');
        setAvailableCameras(cameras);
        setAvailableMics(mics);
        if (cameras.length > 0 && !selectedCamera) setSelectedCamera(cameras[0].deviceId);
        if (mics.length > 0 && !selectedMic) setSelectedMic(mics[0].deviceId);
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  // Sync screen share state
  useEffect(() => {
    setIsScreenSharing(isScreenSharingSync);
  }, [isScreenSharingSync]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update participant count
  const updateParticipantCount = useCallback(() => {
    if (callInstanceRef.current?.state?.participants) {
      const count = callInstanceRef.current.state.participants.size;
      setParticipantCount(count);
    }
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerStartedRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Handle participant joined
  const handleParticipantJoined = useCallback((e) => {
    const participantName = e.participant?.name || "Someone";
    const count = callInstanceRef.current?.state?.participants?.size || 1;
    setParticipantCount(count);
    setIsCallAccepted(true);

    // Stop waiting ringtone
    if (waitingRingtoneRef.current) {
      waitingRingtoneRef.current.pause();
      waitingRingtoneRef.current.currentTime = 0;
      setIsRinging(false);
    }

    if (count > 1) {
      toast.success(`${participantName} joined the call`, {
        duration: 3000,
        icon: "👋",
      });
    }
  }, []);

  // Handle call ended
  const handleCallEnded = useCallback(() => {
    if (isUserEndingCallRef.current) return;
    
    if (waitingRingtoneRef.current) {
      waitingRingtoneRef.current.pause();
      waitingRingtoneRef.current.currentTime = 0;
    }
    
    toast.success("Call ended");
    navigate("/");
  }, [navigate]);

  // Handle connection change
  const handleConnectionChange = useCallback((e) => {
    if (e.online === false) {
      toast.error("Network connection lost. Please check your internet.");
    } else if (e.online === true) {
      toast.success("Connection restored");
    }
  }, []);

  // Initialize call
  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      if (!videoClient || !authUser || !callId) return;
      if (hasJoinedRef.current) {
        console.log("⏭️ Already joined, skipping...");
        return;
      }

      try {
        console.log("📞 Initializing call:", callId);
        
        const callInstance = videoClient.call("default", callId);
        callInstanceRef.current = callInstance;
        
        // Check if current user is the caller
        const isUserCaller = callInstance.state?.createdBy?.id === authUser._id;
        
        // If caller and call not started, show waiting/ringing
        if (isUserCaller && !callInstance.state?.call?.started_at) {
          setIsRinging(true);
          
          // Play waiting ringtone for caller
          waitingRingtoneRef.current = new Audio("/waiting-ringtone.mp3");
          waitingRingtoneRef.current.loop = true;
          waitingRingtoneRef.current.play().catch(e => console.log("Audio play failed:", e));
          
          // Listen for call started event
          callInstance.on("call.started", () => {
            setIsRinging(false);
            setIsCallAccepted(true);
            if (waitingRingtoneRef.current) {
              waitingRingtoneRef.current.pause();
              waitingRingtoneRef.current.currentTime = 0;
            }
            startTimer();
          });
        }
        
        // Join the call
        if (!callInstance.state?.joined && !hasJoinedRef.current) {
          hasJoinedRef.current = true;
          await callInstance.join().catch((err) => {
            console.error("Join failed:", err);
            hasJoinedRef.current = false;
            toast.error("Failed to join call");
          });
        }
        
        // 🔥 Handle call type (audio/video) from URL query params
        const type = new URLSearchParams(location.search).get("type");
        if (type === "audio") {
          console.log("🔊 Audio call - disabling camera");
          await callInstance.camera.disable();
        } else if (type === "video") {
          console.log("📹 Video call - enabling camera");
          await callInstance.camera.enable();
        }
        
        if (!isMounted) return;
        
        console.log("✅ Successfully joined call");
        
        // Add event listeners
        callInstance.on("call.updated", updateParticipantCount);
        callInstance.on("participant-joined", handleParticipantJoined);
        callInstance.on("connection.changed", handleConnectionChange);
        callInstance.on("call.ended", handleCallEnded);
        
        updateParticipantCount();
        
        // Start timer if call already started
        if (callInstance.state?.call?.started_at || callInstance.state?.started) {
          startTimer();
          setIsCallAccepted(true);
          setIsRinging(false);
          if (waitingRingtoneRef.current) {
            waitingRingtoneRef.current.pause();
            waitingRingtoneRef.current.currentTime = 0;
          }
        } else {
          callInstance.on("call.started", () => {
            startTimer();
          });
        }
        
        setCall(callInstance);
        
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
        hasJoinedRef.current = false;
      } finally {
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    initCall();

    return () => {
      isMounted = false;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        timerStartedRef.current = false;
      }
      
      if (waitingRingtoneRef.current) {
        waitingRingtoneRef.current.pause();
        waitingRingtoneRef.current.currentTime = 0;
      }
      
      if (callInstanceRef.current) {
        callInstanceRef.current.off("call.updated", updateParticipantCount);
        callInstanceRef.current.off("participant-joined", handleParticipantJoined);
        callInstanceRef.current.off("connection.changed", handleConnectionChange);
        callInstanceRef.current.off("call.started", startTimer);
        callInstanceRef.current.off("call.ended", handleCallEnded);
        
        if (callInstanceRef.current.state?.joined) {
          callInstanceRef.current.leave();
        }
      }
    };
  }, [videoClient, callId, authUser, location]);

  // Toggle microphone
  const toggleMicrophone = async () => {
    if (call) {
      try {
        if (isMuted) {
          await call.microphone.enable();
          toast.success("Microphone on");
        } else {
          await call.microphone.disable();
          toast.success("Microphone off");
        }
      } catch (error) {
        console.error("Error toggling microphone:", error);
        toast.error("Failed to toggle microphone");
      }
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (call) {
      try {
        if (isVideoOff) {
          await call.camera.enable();
          toast.success("Camera on");
        } else {
          await call.camera.disable();
          toast.success("Camera off");
        }
      } catch (error) {
        console.error("Error toggling camera:", error);
        toast.error("Failed to toggle camera");
      }
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!call) return;

    try {
      if (isScreenSharing) {
        await call.screenShare.disable();
        toast.success("Screen sharing stopped");
      } else {
        await call.screenShare.enable();
        toast.success("Screen sharing started");
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast.error("Screen share failed");
    }
  };

  // Switch camera
  const switchCamera = async (deviceId) => {
    if (call) {
      try {
        await call.camera.setDevice(deviceId);
        setSelectedCamera(deviceId);
        toast.success("Camera switched");
      } catch (error) {
        console.error("Error switching camera:", error);
        toast.error("Failed to switch camera");
      }
    }
  };

  // Switch microphone
  const switchMicrophone = async (deviceId) => {
    if (call) {
      try {
        await call.microphone.setDevice(deviceId);
        setSelectedMic(deviceId);
        toast.success("Microphone switched");
      } catch (error) {
        console.error("Error switching microphone:", error);
        toast.error("Failed to switch microphone");
      }
    }
  };

  const handleEndCall = async () => {
    isUserEndingCallRef.current = true;
    if (callInstanceRef.current && callInstanceRef.current.state?.joined) {
      await callInstanceRef.current.leave();
    }
    navigate("/");
  };

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 relative">
      
      {/* Ringing Overlay - When waiting for answer */}
      {isRinging && !isCallAccepted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div className="text-center animate-pulse">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
              <Phone className="w-16 h-16 text-white transform rotate-90" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3">Ringing...</h2>
            <p className="text-gray-300 text-lg">Waiting for the other person to answer</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-400"></div>
            </div>
            
            <button
              onClick={handleEndCall}
              className="mt-10 px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full text-white font-semibold transition-all transform hover:scale-105 shadow-xl"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  {availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Microphone
                </label>
                <select
                  value={selectedMic}
                  onChange={(e) => switchMicrophone(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  {availableMics.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/10">
        <img 
          src="/xebure-logo.png" 
          alt="Xebure" 
          className="w-10 h-10 object-contain rounded-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=40";
          }}
        />
        <div className="hidden sm:block">
          <span className="text-white text-lg font-bold">Xebure Call</span>
          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span className="text-white/80 text-[10px]">Secure Call</span>
          </div>
        </div>
      </div>

      {/* Call Info Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs">Live</span>
        </div>
        <div className="w-px h-4 bg-white/20"></div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-400" />
          <span className="text-white text-xs">{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-4 bg-white/20"></div>
        <div className="flex items-center gap-1">
          <span className="text-white text-xs font-mono">{formatDuration(callDuration)}</span>
        </div>
      </div>

      <div className="relative z-10 h-full w-full">
        {videoClient && call ? (
          <StreamVideo client={videoClient}>
            <StreamCall call={call}>
              <div className="relative h-full w-full">
                <div className="absolute inset-0">
                  <StreamTheme className="h-full w-full">
                    <div className="relative h-full w-full">
                      
                      {/* Main Video Grid */}
                      <div className="relative z-10 h-full w-full p-4">
                        <SpeakerLayout 
                          className="rounded-2xl overflow-hidden shadow-2xl"
                        />
                      </div>
                      
                      {/* Call Controls Bar */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-black/70 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-white/20">
                          <div className="flex items-center gap-4">
                            
                            {/* Microphone Control */}
                            <button
                              onClick={toggleMicrophone}
                              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                                isMuted 
                                  ? "bg-red-500 hover:bg-red-600" 
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                            </button>

                            {/* Camera Control */}
                            <button
                              onClick={toggleCamera}
                              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                                isVideoOff 
                                  ? "bg-gray-700 hover:bg-gray-600" 
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                              title={isVideoOff ? "Turn camera on" : "Turn camera off"}
                            >
                              {isVideoOff ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
                            </button>

                            {/* Screen Share Control */}
                            <button
                              onClick={toggleScreenShare}
                              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                                isScreenSharing 
                                  ? "bg-green-500 hover:bg-green-600" 
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                              title={isScreenSharing ? "Stop sharing" : "Share screen"}
                            >
                              {isScreenSharing ? <MonitorDown className="w-5 h-5 text-white" /> : <MonitorUp className="w-5 h-5 text-white" />}
                            </button>

                            {/* Settings Button */}
                            <button
                              onClick={() => setShowSettings(true)}
                              className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
                              title="Settings"
                            >
                              <Settings className="w-5 h-5 text-white" />
                            </button>

                            {/* End Call Button */}
                            <button
                              onClick={handleEndCall}
                              className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                              title="End call"
                            >
                              <PhoneOff className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Watermark */}
                      <div className="absolute bottom-4 right-4 z-20 opacity-30">
                        <div className="flex items-center gap-1">
                          <img src="/xebure-logo.png" alt="Xebure" className="w-5 h-5 object-contain" />
                          <span className="text-white text-[10px]">Xebure</span>
                        </div>
                      </div>
                    </div>
                  </StreamTheme>
                </div>
              </div>
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-8 text-center max-w-md mx-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <PhoneOff className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Could Not Initialize Call</h3>
              <p className="text-gray-300 text-sm mb-4">
                Please refresh the page or try again later.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;