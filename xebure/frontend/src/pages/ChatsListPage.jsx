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
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Premium Header with Larger Logo */}
      <div className="bg-base-200/50 border-b border-base-300 sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Larger Logo Icon */}
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-primary-content" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-sm text-base-content/60 hidden sm:block">
                  Chat with your language partners
                </p>
              </div>
            </div>
            <div className="bg-yellow-500/10 px-4 py-2 rounded-full hidden sm:flex items-center gap-2">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base-content"
            />
          </div>
        </div>

        {/* Chats List */}
        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary/10 to-base-200/50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-base-content/40" />
            </div>
            <h3 className="text-xl font-bold text-base-content mb-2">No conversations yet</h3>
            <p className="text-base-content/60 max-w-md mb-6">
              Connect with friends and start chatting to see your conversations here!
            </p>
            <Link to="/friends">
              <button className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl shadow-md hover:shadow-lg transition-all">
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
                  className="group block bg-base-100 hover:bg-base-200 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-base-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary p-0.5">
                          <div className="w-full h-full rounded-full bg-base-100 overflow-hidden">
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
                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100"></div>
                      </div>
                      
                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                            {friend.fullName}
                          </h3>
                          <span className="text-xs text-base-content/40 ml-2 flex-shrink-0">
                            {lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-base-content/50 truncate flex-1">
                            {lastMessage}
                          </p>
                          {/* Language badges */}
                          <div className="flex gap-1">
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {friend.nativeLanguage}
                            </span>
                            <span className="text-[10px] bg-base-300 text-base-content/60 px-1.5 py-0.5 rounded-full">
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
          <div className="mt-6 bg-gradient-to-r from-primary/5 to-base-200/50 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <p className="text-xs text-base-content/60">
                <span className="font-semibold text-primary">Premium:</span> Send voice messages, share files, and more!
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