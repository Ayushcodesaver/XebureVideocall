import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { videoClient } = useVideoClient();
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMics, setAvailableMics] = useState([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(100);
  
  // ✅ Use refs for cleanup handlers
  const timerRef = useRef(null);
  const updateParticipantCountRef = useRef(null);
  const startTimerRef = useRef(null);
  const callEndedRef = useRef(null);
  const callInstanceRef = useRef(null);
  const isUserEndingCallRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const timerStartedRef = useRef(false);
  
  // ✅ Volume control refs (Web Audio API)
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceStreamRef = useRef(null);
  const isVolumeMutedRef = useRef(false);

  const { authUser, isLoading } = useAuthUser();

  // ✅ Safer boolean checks
  const isMuted = call?.microphone?.state?.muted === true;
  const isVideoOff = call?.camera?.state?.enabled === false;
  const isScreenSharingSync = call?.screenShare?.state?.enabled === true;

  // ✅ Device effect
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

  // ✅ Setup Web Audio for real volume control
  useEffect(() => {
    if (!call) return;

    const setupAudioControl = async () => {
      try {
        // Get local audio stream
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        sourceStreamRef.current = localStream;
        
        // Create Audio Context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        // Create Gain Node (for volume control)
        const gainNode = audioContext.createGain();
        gainNodeRef.current = gainNode;
        gainNode.gain.value = volumeLevel / 100; // Set initial volume
        
        // Create source from stream
        const source = audioContext.createMediaStreamSource(localStream);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Resume AudioContext on user interaction
        if (audioContext.state === 'suspended') {
          const resumeAudio = () => {
            audioContext.resume();
            document.removeEventListener('click', resumeAudio);
          };
          document.addEventListener('click', resumeAudio);
        }
        
        console.log("🎵 Audio control initialized");
      } catch (error) {
        console.error("Failed to setup audio control:", error);
      }
    };

    setupAudioControl();

    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (sourceStreamRef.current) {
        sourceStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [call]);

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

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Stable handlers
  const updateParticipantCount = useCallback(() => {
    if (callInstanceRef.current?.state?.participants) {
      const count = callInstanceRef.current.state.participants.size;
      setParticipantCount(count);
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerStartedRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // ✅ Fixed handleParticipantJoined - no stale closure
  const handleParticipantJoined = useCallback((e) => {
    const participantName = e.participant?.name || "Someone";

    // Read latest count from ref, not state
    const count = callInstanceRef.current?.state?.participants?.size || 1;

    setParticipantCount(count);

    // Only show toast for additional participants (not self)
    if (count > 1) {
      toast.success(`${participantName} joined the call`, {
        duration: 3000,
        icon: "👋",
      });
    }
  }, []);

  const handleCallEnded = useCallback(() => {
    if (isUserEndingCallRef.current) return;
    toast.success("Call ended");
    navigate("/");
  }, [navigate]);

  const handleConnectionChange = useCallback((e) => {
    if (e.online === false) {
      toast.error("Network connection lost. Please check your internet.");
    } else if (e.online === true) {
      toast.success("Connection restored");
    }
  }, []);

  // Store refs for cleanup
  updateParticipantCountRef.current = updateParticipantCount;
  startTimerRef.current = startTimer;
  callEndedRef.current = handleCallEnded;

  // ✅ Initialize call with JOIN LOCK
  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      if (!videoClient || !authUser || !callId) return;
      if (hasJoinedRef.current) {
        console.log("⏭️ Already joined, skipping...");
        return;
      }

      hasJoinedRef.current = true;

      try {
        console.log("Joining call using shared video client...");

        const callInstance = videoClient.call("default", callId);
        callInstanceRef.current = callInstance;

        if (!callInstance.state?.joined) {
          await callInstance.join().catch((err) => {
            console.error("Join failed:", err);
            toast.error("Failed to join call");
          });
        }

        if (!isMounted) return;

        console.log("Joined Xebure call successfully");

        // Add event listeners
        callInstance.on("call.updated", updateParticipantCountRef.current);
        callInstance.on("participant-joined", handleParticipantJoined);
        callInstance.on("connection.changed", handleConnectionChange);
        callInstance.on("call.ended", callEndedRef.current);
        
        updateParticipantCount();

        // Fixed timer start - no double start
        if (callInstance.state?.call?.started_at || callInstance.state?.started) {
          startTimer();
        } else {
          callInstance.on("call.started", () => {
            startTimerRef.current();
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
      
      if (callInstanceRef.current) {
        callInstanceRef.current.off("call.updated", updateParticipantCountRef.current);
        callInstanceRef.current.off("participant-joined", handleParticipantJoined);
        callInstanceRef.current.off("connection.changed", handleConnectionChange);
        callInstanceRef.current.off("call.started", startTimerRef.current);
        callInstanceRef.current.off("call.ended", callEndedRef.current);
        
        if (callInstanceRef.current.state?.joined) {
          callInstanceRef.current.leave();
        }
      }
    };
  }, [videoClient, callId]);

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

  // ✅ Fixed screen share handler
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

  // ✅ REAL volume mute using Web Audio API
  const handleVolumeChange = (e) => {
    const value = parseInt(e.target.value);
    setVolumeLevel(value);
    
    if (gainNodeRef.current) {
      const normalizedVolume = value / 100;
      gainNodeRef.current.gain.value = normalizedVolume;
      
      if (value === 0) {
        setIsVolumeMuted(true);
        isVolumeMutedRef.current = true;
      } else if (isVolumeMutedRef.current && value > 0) {
        setIsVolumeMuted(false);
        isVolumeMutedRef.current = false;
      }
    }
  };

  const toggleVolume = () => {
    if (!gainNodeRef.current) {
      toast.error("Audio control not available");
      return;
    }

    try {
      if (isVolumeMutedRef.current) {
        // Unmute - restore volume
        const newVolume = volumeLevel === 0 ? 100 : volumeLevel;
        gainNodeRef.current.gain.value = newVolume / 100;
        setIsVolumeMuted(false);
        isVolumeMutedRef.current = false;
        setVolumeLevel(newVolume);
        toast.success("Volume on");
        
        // Resume AudioContext if suspended
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } else {
        // Mute - set volume to 0
        gainNodeRef.current.gain.value = 0;
        setIsVolumeMuted(true);
        isVolumeMutedRef.current = true;
        toast.success("Volume off");
      }
    } catch (error) {
      console.error("Error toggling volume:", error);
      toast.error("Failed to change volume");
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

      {/* Volume Slider Modal */}
      {showVolumeSlider && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/70 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">Volume Control</span>
            <button
              onClick={() => setShowVolumeSlider(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volumeLevel}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-white text-xs mt-2">
            <span>🔇</span>
            <span>{volumeLevel}%</span>
            <span>🔊</span>
          </div>
        </div>
      )}

      {/* Logo Overlay - Top Left */}
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

      {/* Call Info Overlay - Top Right */}
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

                            {/* Volume Control - Now with REAL audio */}
                            <div className="relative">
                              <button
                                onClick={toggleVolume}
                                onMouseEnter={() => setShowVolumeSlider(true)}
                                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
                                title={isVolumeMuted ? "Unmute volume" : "Mute volume"}
                              >
                                {isVolumeMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                              </button>
                            </div>

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