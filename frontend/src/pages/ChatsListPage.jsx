import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserFriends } from "../lib/api";
import { MessageCircle, Search, Sparkles, Crown } from "lucide-react";
import { useState } from "react";

const ChatsListPage = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4DDD3] via-[#f5f2ed] to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#00A19B]/20 border-t-[#00A19B] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4DDD3] via-[#f5f2ed] to-white">
      {/* Premium Header with Larger Logo */}
      <div className="bg-gradient-to-r from-[#00A19B]/5 to-[#E4DDD3]/20 border-b border-[#00A19B]/10 sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Larger Logo Icon */}
              <div className="w-12 h-12 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00A19B] to-[#00837e] bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Chat with your language partners
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 px-4 py-2 rounded-full hidden sm:flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-600 font-medium">
                {friends.length} Contacts
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:border-[#00A19B] focus:ring-2 focus:ring-[#00A19B]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Chats List */}
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-[#00A19B]/10 to-[#E4DDD3]/20 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No conversations yet</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Connect with friends and start chatting to see your conversations here!
            </p>
            <Link to="/friends">
              <button className="px-6 py-2 bg-gradient-to-r from-[#00A19B] to-[#00837e] text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                Find Friends →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFriends.map((friend, index) => {
              const lastMessage = "Tap to start chatting...";
              const lastMessageTime = "Just now";
              
              return (
                <Link
                  key={friend._id}
                  to={`/chat/${friend._id}`}
                  className="group block bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00A19B] to-[#00837e] p-0.5">
                          <div className="w-full h-full rounded-full bg-white overflow-hidden">
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
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      
                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 group-hover:text-[#00A19B] transition-colors truncate">
                            {friend.fullName}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500 truncate flex-1">
                            {lastMessage}
                          </p>
                          {/* Language badges */}
                          <div className="flex gap-1">
                            <span className="text-[10px] bg-[#00A19B]/10 text-[#00837e] px-1.5 py-0.5 rounded-full">
                              {friend.nativeLanguage}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                              {friend.learningLanguage}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Premium Feature Tip */}
        {friends.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-[#00A19B]/5 to-[#E4DDD3]/20 rounded-xl p-3 border border-[#00A19B]/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-[#00A19B]">Premium:</span> Send voice messages, share files, and more!
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .group {
          animation: slideIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default ChatsListPage;