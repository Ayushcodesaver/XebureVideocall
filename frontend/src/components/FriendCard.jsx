import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MessageCircle, Video, Crown, Sparkles, Heart } from "lucide-react";
import toast from "react-hot-toast";

const FriendCard = ({ friend, index = 0 }) => {
  const handleVideoCall = () => {
    toast.success(`Starting video call with ${friend.fullName}... 🎥`);
  };

  const isPremium = index % 3 === 0; // Every 3rd friend gets premium badge

  return (
    <div 
      className="group bg-base-100 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-base-300"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      
      {/* Premium Gradient Border on Hover - Theme aware */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm"></div>
      
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Crown className="w-3 h-3" />
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* Online Status Indicator - Theme aware */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-base-300/70 backdrop-blur-sm rounded-full px-2 py-0.5">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] text-base-content">Online</span>
      </div>

      <div className="relative z-10 p-5 bg-base-100/95 backdrop-blur-sm">
        
        {/* USER INFO - Premium Avatar - Theme aware */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative w-14 h-14 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300 overflow-hidden shadow-md">
              <img 
                src={friend.profilePic} 
                alt={friend.fullName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${friend.fullName}`;
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-base-100"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-base-content group-hover:text-primary transition-colors line-clamp-1">
              {friend.fullName}
            </h3>
            {friend.location && (
              <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                <span>📍</span> {friend.location}
              </p>
            )}
          </div>
        </div>

        {/* Languages with Flags - Premium Styling - Theme aware */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-primary/10 rounded-full px-3 py-1.5 flex items-center gap-1">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="text-xs text-primary font-medium">
              {friend.nativeLanguage}
            </span>
            <span className="text-[10px] text-base-content/40">(Native)</span>
          </div>
          <div className="bg-base-300 rounded-full px-3 py-1.5 flex items-center gap-1">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="text-xs text-base-content font-medium">
              {friend.learningLanguage}
            </span>
            <span className="text-[10px] text-base-content/40">(Learning)</span>
          </div>
        </div>

        {/* Bio Preview - Theme aware */}
        {friend.bio && (
          <p className="text-xs text-base-content/60 mb-4 line-clamp-2 italic">
            "{friend.bio.substring(0, 80)}{friend.bio.length > 80 ? '...' : ''}"
          </p>
        )}

        {/* Action Buttons - Premium - Theme aware */}
        <div className="flex gap-2">
          <Link 
            to={`/chat/${friend._id}`} 
            className="flex-1 btn bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-content border-none rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </Link>
          
          <button 
            onClick={handleVideoCall}
            className="p-2 rounded-xl bg-base-200 hover:bg-primary/10 transition-all duration-300 group-hover:scale-105"
            title="Start video call"
          >
            <Video className="w-4 h-4 text-base-content/50 group-hover:text-primary transition-colors" />
          </button>
          
          <button 
            className="p-2 rounded-xl bg-base-200 hover:bg-red-500/10 transition-all duration-300"
            title="Send heart"
          >
            <Heart className="w-4 h-4 text-base-content/40 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Mutual Interests Tag - Theme aware */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-base-content/50">92% match</span>
          </div>
          <div className="text-[10px] text-base-content/50 flex items-center gap-1">
            Active now
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .group {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="w-4 h-3 rounded-sm shadow-sm object-cover mr-1"
      />
    );
  }
  return null;
}