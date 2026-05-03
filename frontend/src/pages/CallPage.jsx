import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useVideoClient } from "../context/VideoClientContext";
import { StreamVideo, StreamCall, StreamTheme, SpeakerLayout } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { 
  PhoneOff, Users, Crown, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorDown, Settings, X, Phone, Volume2, 
  VolumeX, Camera, User, LogOut, Clock 
} from "lucide-react";

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { videoClient } = useVideoClient();
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMics, setAvailableMics] = useState([]);
  
  const timerRef = useRef(null);
  const callRef = useRef(null);
  const { authUser, isLoading } = useAuthUser();

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableCameras(devices.filter(d => d.kind === 'videoinput'));
        setAvailableMics(devices.filter(d => d.kind === 'audioinput'));
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };
    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => navigator.mediaDevices.removeEventListener("devicechange", getDevices);
  }, []);

  // Join call
  useEffect(() => {
    if (!videoClient || !authUser || !callId) return;
    if (callRef.current) return;

    const joinCall = async () => {
      try {
        const newCall = videoClient.call("default", callId);
        callRef.current = newCall;
        await newCall.join();
        
        if (callId.startsWith("ac_")) {
          await newCall.camera.disable();
        }
        
        setCall(newCall);
        
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        const updateCount = () => {
          setParticipantCount(newCall.state?.participants?.size || 1);
        };
        newCall.on("participant-joined", updateCount);
        newCall.on("participant-left", updateCount);
        updateCount();
        
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Failed to join call");
      } finally {
        setIsConnecting(false);
      }
    };

    joinCall();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videoClient, callId, authUser]);

  const toggleMicrophone = async () => {
    if (call) {
      if (isMuted) {
        await call.microphone.enable();
        toast.success("Microphone on");
      } else {
        await call.microphone.disable();
        toast.success("Microphone off");
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = async () => {
    if (call) {
      if (isVideoOff) {
        await call.camera.enable();
        toast.success("Camera on");
      } else {
        await call.camera.disable();
        toast.success("Camera off");
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!call) return;
    if (isScreenSharing) {
      await call.screenShare.disable();
      toast.success("Screen sharing stopped");
    } else {
      await call.screenShare.enable();
      toast.success("Screen sharing started");
    }
    setIsScreenSharing(!isScreenSharing);
  };

  const switchCamera = async (deviceId) => {
    if (call) {
      await call.camera.setDevice(deviceId);
      setSelectedCamera(deviceId);
      toast.success("Camera switched");
    }
  };

  const switchMicrophone = async (deviceId) => {
    if (call) {
      await call.microphone.setDevice(deviceId);
      setSelectedMic(deviceId);
      toast.success("Microphone switched");
    }
  };

  const handleEndCall = async () => {
    if (call) {
      await call.leave();
    }
    navigate("/");
  };

  if (isLoading || isConnecting) return <PageLoader />;

  if (!videoClient || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none"></div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent pt-4 px-6 pb-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Xebure Call</h1>
              <p className="text-white/50 text-xs">Secure • HD Quality</p>
            </div>
          </div>
          
          {/* Call Info */}
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">Live</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">{participantCount}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-white text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              title="Participants"
            >
              <Users className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 Main Video Grid */}
      <div className="relative z-10 h-full w-full">
        <StreamVideo client={videoClient}>
          <StreamCall call={call}>
            <div className="relative h-full w-full">
              <StreamTheme className="h-full w-full">
                <div className="relative h-full w-full p-4 pt-24">
                  <SpeakerLayout className="rounded-2xl overflow-hidden shadow-2xl h-full" />
                </div>
              </StreamTheme>
            </div>
          </StreamCall>
        </StreamVideo>
      </div>

      {/* 🔥 Beautiful Control Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black/60 backdrop-blur-2xl rounded-2xl px-4 py-2 flex items-center gap-2 border border-white/20 shadow-2xl">
          
          {/* Microphone */}
          <button
            onClick={toggleMicrophone}
            className={`group relative p-3 rounded-xl transition-all duration-200 ${
              isMuted 
                ? "bg-red-500/80 hover:bg-red-600" 
                : "bg-white/10 hover:bg-white/20"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            className={`group relative p-3 rounded-xl transition-all duration-200 ${
              isVideoOff 
                ? "bg-white/10 hover:bg-white/20" 
                : "bg-red-500/80 hover:bg-red-600"
            }`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isVideoOff ? "Camera on" : "Camera off"}
            </span>
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`group relative p-3 rounded-xl transition-all duration-200 ${
              isScreenSharing 
                ? "bg-green-500/80 hover:bg-green-600" 
                : "bg-white/10 hover:bg-white/20"
            }`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            {isScreenSharing ? <MonitorDown className="w-5 h-5 text-white" /> : <MonitorUp className="w-5 h-5 text-white" />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isScreenSharing ? "Stop sharing" : "Share screen"}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20 mx-1"></div>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="group relative p-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-500/30"
            title="End call"
          >
            <PhoneOff className="w-5 h-5 text-white" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              End call
            </span>
          </button>
        </div>
      </div>

      {/* 🔥 Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-5">
              {/* Camera Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  {availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Microphone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Microphone
                </label>
                <select
                  value={selectedMic}
                  onChange={(e) => switchMicrophone(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
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
                className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> Participants ({participantCount})
              </h2>
              <button onClick={() => setShowParticipants(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{authUser?.fullName || "You"}</p>
                  <p className="text-xs text-green-400">Host • You</p>
                </div>
                <div className="flex gap-1">
                  {isMuted && <MicOff className="w-4 h-4 text-white/40" />}
                  {isVideoOff && <VideoOff className="w-4 h-4 text-white/40" />}
                </div>
              </div>
              {participantCount > 1 && (
                <div className="text-center text-white/40 text-sm py-2">
                  +{participantCount - 1} other participant{participantCount > 2 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallPage;