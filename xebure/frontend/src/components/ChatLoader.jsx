import { LoaderIcon, Sparkles, MessageCircle, Heart } from "lucide-react";

function ChatLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#E4DDD3] via-[#f5f2ed] to-white relative overflow-hidden">
      
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00A19B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E4DDD3] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00837e] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Sparkles className="w-2 h-2 text-[#00A19B] opacity-50" />
          </div>
        ))}
      </div>

      {/* Main Loader Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Logo with Animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-2xl blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <img 
              src="/xebure-logo.png" 
              alt="Xebure" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=80";
              }}
            />
          </div>
        </div>

        {/* Premium Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#00A19B]/20 border-t-[#00A19B] border-r-[#00837e] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#00A19B] to-[#00837e] bg-clip-text text-transparent animate-pulse">
            Connecting to Chat
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 justify-center">
            <MessageCircle className="w-3 h-3 text-[#00A19B]" />
            Securing your conversation
            <Heart className="w-3 h-3 text-red-400 animate-pulse" />
          </p>
        </div>

        {/* Loading Steps */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center gap-2 animate-fadeIn">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Establishing secure connection</span>
          </div>
          <div className="flex items-center gap-2 animate-fadeIn delay-150">
            <div className="w-1.5 h-1.5 bg-[#00A19B] rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Loading messages</span>
          </div>
          <div className="flex items-center gap-2 animate-fadeIn delay-300">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Preparing your chat</span>
          </div>
        </div>

        {/* Premium Features Badge */}
        <div className="mt-8 flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full shadow-sm">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span className="text-[10px] text-gray-500">End-to-end encrypted</span>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <span className="text-[10px] text-gray-500">Xebure Premium</span>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}

export default ChatLoader;