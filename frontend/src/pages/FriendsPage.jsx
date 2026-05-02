import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFriends, removeFriend } from "../lib/api";
import { MessageCircle, Video, UserMinus, Sparkles, Crown, Users } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

// Helper function for language flags
const getLanguageFlag = (language) => {
  if (!language) return null;
  const flagMap = {
    english: "gb",
    spanish: "es",
    french: "fr",
    german: "de",
    mandarin: "cn",
    japanese: "jp",
    korean: "kr",
    hindi: "in",
    russian: "ru",
    portuguese: "pt",
    arabic: "sa",
    italian: "it",
    turkish: "tr",
    dutch: "nl",
  };
  const code = flagMap[language.toLowerCase()];
  if (code) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${code}.png`}
        alt={language}
        className="w-4 h-3 rounded-sm shadow-sm object-cover mr-1"
      />
    );
  }
  return null;
};

const FriendsPage = () => {
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: removeFriendMutation, isPending } = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend removed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    },
  });

  const handleRemoveFriend = (friendId, friendName) => {
    if (window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      removeFriendMutation(friendId);
    }
  };

  const handleVideoCall = (friendName) => {
    toast.success(`Starting video call with ${friendName}... 🎥`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Premium Header - Theme aware */}
      <div className="bg-base-200/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-primary-content" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  My Friends
                </h1>
                <p className="text-sm text-base-content/60">
                  Connect and chat with your language partners
                </p>
              </div>
            </div>
            <div className="bg-yellow-500/10 px-4 py-2 rounded-full hidden sm:flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-600 font-medium">
                {friends.length} Friends
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Card - Theme aware */}
        <div className="mb-8 bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-base-content">{friends.length}</p>
                <p className="text-sm text-base-content/60">Language Partners</p>
              </div>
            </div>
            <Link to="/">
              <button className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl text-sm shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                Find More Friends
              </button>
            </Link>
          </div>
        </div>

        {/* Friends Grid */}
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-base-content mb-2">No Friends Yet</h3>
            <p className="text-base-content/60 max-w-md mb-6">
              Connect with language partners on the Home page to start practicing together!
            </p>
            <Link to="/">
              <button className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                Find Friends →
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend, index) => (
              <div
                key={friend._id}
                className="group bg-base-100 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-base-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative p-6">
                  {/* Premium Badge for some friends */}
                  {index % 3 === 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Crown className="w-3 h-3" />
                        <span>Premium</span>
                      </div>
                    </div>
                  )}

                  {/* User Avatar - Theme aware */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300 overflow-hidden shadow-md">
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
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-base-100"></div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                        {friend.fullName}
                      </h3>
                      {friend.location && (
                        <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                          <span>📍</span> {friend.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Languages - Theme aware */}
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

                  {/* Bio */}
                  {friend.bio && (
                    <p className="text-xs text-base-content/60 mb-4 line-clamp-2 italic">
                      "{friend.bio.substring(0, 80)}{friend.bio.length > 80 ? '...' : ''}"
                    </p>
                  )}

                  {/* Action Buttons - Theme aware */}
                  <div className="flex gap-2">
                    <Link
                      to={`/chat/${friend._id}`}
                      className="flex-1 btn bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-content border-none rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Link>
                    
                    <button
                      onClick={() => handleVideoCall(friend.fullName)}
                      className="p-2 rounded-xl bg-base-200 hover:bg-primary/10 transition-all duration-300"
                      title="Start video call"
                    >
                      <Video className="w-4 h-4 text-base-content/60 hover:text-primary transition-colors" />
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFriend(friend._id, friend.fullName)}
                      disabled={isPending}
                      className="p-2 rounded-xl bg-base-200 hover:bg-red-500/10 transition-all duration-300"
                      title="Remove friend"
                    >
                      <UserMinus className="w-4 h-4 text-base-content/40 hover:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Mutual Interests - Theme aware */}
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-base-300">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] text-base-content/50">
                      Language Exchange Partner
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default FriendsPage;