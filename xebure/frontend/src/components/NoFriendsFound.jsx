import { UsersIcon, UserPlusIcon, Sparkles, Heart, Globe, MessageCircle } from "lucide-react";
import { Link } from "react-router";

const NoFriendsFound = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
      
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-[#00A19B]/5 to-[#E4DDD3]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-[#00837e]/5 to-[#00A19B]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-10 animate-float">
          <Sparkles className="w-3 h-3 text-yellow-400 opacity-40" />
        </div>
        <div className="absolute bottom-5 right-10 animate-float-delay">
          <Heart className="w-4 h-4 text-red-400 opacity-30" />
        </div>
        <div className="absolute top-1/2 right-5 animate-float-slow">
          <Globe className="w-3 h-3 text-[#00A19B] opacity-30" />
        </div>
        <div className="absolute bottom-1/2 left-5 animate-float">
          <MessageCircle className="w-3 h-3 text-green-400 opacity-30" />
        </div>
      </div>

      {/* Premium Icon Container */}
      <div className="relative mb-6 flex justify-center">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-[#00A19B]/20 to-[#00837e]/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#00A19B]/10 to-[#E4DDD3]/30 flex items-center justify-center shadow-2xl border border-white/50">
          <UsersIcon className="w-10 h-10 text-[#00A19B]" />
        </div>
        
        {/* Premium Badge */}
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full p-1.5 shadow-lg">
          <UserPlusIcon className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Main Text */}
      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
        Build Your Network! 🌟
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Connect with language partners below to start practicing together and make new friends!
      </p>

      {/* Stats / Motivation */}
      <div className="mt-6 flex justify-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00A19B]">50+</div>
          <div className="text-xs text-gray-400">Active Learners</div>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00A19B]">14</div>
          <div className="text-xs text-gray-400">Languages</div>
        </div>
        <div className="w-px h-8 bg-gray-200"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00A19B]">24/7</div>
          <div className="text-xs text-gray-400">Community</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <button className="px-5 py-2.5 bg-gradient-to-r from-[#00A19B] to-[#00837e] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
            <UserPlusIcon className="w-4 h-4" />
            Find Friends
          </button>
        </Link>
        <button className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Explore Partners
        </button>
      </div>

      {/* Premium Tip */}
      <div className="mt-6 px-4 py-2 bg-gradient-to-r from-[#00A19B]/5 to-[#E4DDD3]/10 rounded-full inline-block mx-auto">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span>💡 Tip: Complete your profile to get better partner matches!</span>
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
};

export default NoFriendsFound;