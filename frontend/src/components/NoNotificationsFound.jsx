import { BellIcon, Sparkles, Heart, MessageCircle, UserPlus } from "lucide-react";

function NoNotificationsFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center relative overflow-hidden">
      
      {/* Premium Animated Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#00A19B]/5 to-[#E4DDD3]/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 animate-float-slow">
          <Sparkles className="w-3 h-3 text-yellow-400 opacity-40" />
        </div>
        <div className="absolute bottom-10 right-10 animate-float-delay">
          <Heart className="w-4 h-4 text-red-400 opacity-30" />
        </div>
        <div className="absolute top-20 right-20 animate-float">
          <MessageCircle className="w-3 h-3 text-[#00A19B] opacity-30" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float-slow">
          <UserPlus className="w-3 h-3 text-green-400 opacity-30" />
        </div>
      </div>

      {/* Premium Icon Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full blur-xl opacity-40 animate-pulse"></div>
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#00A19B]/10 to-[#E4DDD3]/30 flex items-center justify-center shadow-2xl border border-white/50">
          <BellIcon className="w-10 h-10 text-[#00A19B]" />
        </div>
        
        {/* Premium Badge */}
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1 shadow-lg">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Main Text */}
      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
        Quiet Here! ✨
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        No notifications yet. When you receive friend requests or messages, they'll appear here.
      </p>

      {/* What to do next */}
      <div className="mt-8 space-y-3">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          Here's what you can do:
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className="px-4 py-2 text-sm bg-gradient-to-r from-[#00A19B] to-[#00837e] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <UserPlus className="w-4 h-4 inline mr-1" />
            Find Friends
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300">
            <MessageCircle className="w-4 h-4 inline mr-1" />
            Start Chat
          </button>
        </div>
      </div>

      {/* Premium Tip */}
      <div className="mt-8 px-4 py-2 bg-gradient-to-r from-[#00A19B]/5 to-[#E4DDD3]/10 rounded-full">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span>Premium Tip: Complete your profile to get more friend requests!</span>
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default NoNotificationsFound;