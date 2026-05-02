import { VideoIcon, Phone, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function CallButton({ handleVideoCall, handleAudioCall }) {
  const [showOptions, setShowOptions] = useState(false);

  const onVideoCall = () => {
    if (handleVideoCall) {
      handleVideoCall();
    } else {
      toast.success("Starting video call... 🎥");
    }
    setShowOptions(false);
  };

  const onAudioCall = () => {
    if (handleAudioCall) {
      handleAudioCall();
    } else {
      toast.success("Starting audio call... 🎙️");
    }
    setShowOptions(false);
  };

  return (
    <div className="relative p-3 border-b border-base-300 flex items-center justify-end max-w-7xl mx-auto w-full bg-gradient-to-r from-transparent to-primary/5">
      
      {/* Premium Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main Container */}
      <div className="relative z-10 flex items-center gap-2">
        
        {/* Call Type Selector */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {/* Animated Ring Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></div>
            
            <VideoIcon className="w-5 h-5 text-primary-content relative z-10" />
            <span className="text-primary-content text-sm font-medium relative z-10 hidden sm:inline">
              Start Call
            </span>
            <Sparkles className="w-3 h-3 text-yellow-300 relative z-10 animate-pulse" />
            
            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-ping"></div>
          </button>

          {/* Dropdown Options - Theme aware */}
          {showOptions && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-base-100/95 backdrop-blur-md rounded-xl shadow-2xl border border-base-300 overflow-hidden z-20 animate-slideDown">
              <div className="p-1 space-y-1">
                {/* Video Call Option */}
                <button
                  onClick={onVideoCall}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <VideoIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-base-content">Video Call</p>
                    <p className="text-xs text-base-content/60">Face to face conversation</p>
                  </div>
                  <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">HD</span>
                </button>

                {/* Audio Call Option */}
                <button
                  onClick={onAudioCall}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-base-content">Audio Call</p>
                    <p className="text-xs text-base-content/60">Voice only conversation</p>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">Crystal</span>
                </button>
              </div>

              {/* Premium Note - Theme aware */}
              <div className="border-t border-base-300 p-2 bg-gradient-to-r from-base-200 to-base-100">
                <p className="text-[10px] text-base-content/40 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                  End-to-end encrypted
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CallButton;