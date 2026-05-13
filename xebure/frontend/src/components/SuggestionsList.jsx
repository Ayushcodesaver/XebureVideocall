import { useState, useEffect } from "react";
import { Users, UserPlus, Check, Loader2, Crown, Sparkles } from "lucide-react";
import { getSuggestions, sendFriendRequest } from "../lib/api";
import UserProfileModal from "./UserProfileModal";
import toast from "react-hot-toast";

const SuggestionsList = ({ onSuggestionAction }) => {  // ✅ Removed currentUserId
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingIds, setSendingIds] = useState({});
  const [sentIds, setSentIds] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await getSuggestions();
      if (response.success) {
        setSuggestions(response.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (userId, userName) => {
    if (sendingIds[userId] || sentIds[userId]) return;
    
    setSendingIds(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await sendFriendRequest(userId);
      if (response.success || response._id) {
        setSentIds(prev => ({ ...prev, [userId]: true }));
        toast.success(`Friend request sent to ${userName}`);
        if (onSuggestionAction) onSuggestionAction();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setSendingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-base-200 flex items-center justify-center">
          <Users className="w-8 h-8 text-base-content/30" />
        </div>
        <p className="text-sm text-base-content/50">No suggestions right now</p>
        <p className="text-xs text-base-content/40 mt-1">Connect with more people to get suggestions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-base-content">People You May Know</h3>
          </div>
          <span className="text-xs text-base-content/40">{suggestions.length} suggestions</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {suggestions.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-all duration-200 group cursor-pointer"
              onClick={() => handleUserClick(user)}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${user.fullName}`}
                  alt={user.fullName}
                  className="relative w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                />
                {user.mutualFriendsCount > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] px-1 rounded-full">
                    {user.mutualFriendsCount}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-base-content truncate">
                    {user.fullName}
                  </p>
                  {(user.mutualFriendsCount >= 3 || user.score > 20) && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-base-content/50 truncate">@{user.username}</p>
                {user.mutualFriendsCount > 0 && (
                  <p className="text-[10px] text-primary/70 mt-0.5">
                    {user.mutualFriendsCount} mutual friend{user.mutualFriendsCount > 1 ? 's' : ''}
                  </p>
                )}
                {(user.sameNativeLanguage || user.sameLearningLanguage) && (
                  <div className="flex gap-1 mt-1">
                    {user.sameNativeLanguage && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                        Same native
                      </span>
                    )}
                    {user.sameLearningLanguage && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded">
                        Same learning
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendRequest(user._id, user.fullName);
                }}
                disabled={sendingIds[user._id] || sentIds[user._id]}
                className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                  sentIds[user._id]
                    ? "bg-green-500/20 text-green-600 cursor-default"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-content"
                }`}
                title={sentIds[user._id] ? "Request Sent" : "Add Friend"}
              >
                {sendingIds[user._id] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : sentIds[user._id] ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Modal */}
      {showModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
};

export default SuggestionsList;