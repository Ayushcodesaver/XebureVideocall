import { useState } from "react";
import { X, MapPin, Languages, MessageCircle, UserPlus, Check, Loader2, Crown } from "lucide-react";
import { sendFriendRequest } from "../lib/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const UserProfileModal = ({ user, onClose }) => {  // ✅ Removed currentUserId
  const [isSending, setIsSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // If user is already friend or request already sent
  const isAlreadyFriend = user?.isFriend === true;
  const isRequestPending = user?.requestPending === true;
  const requestDirection = user?.requestDirection;

  const handleSendRequest = async () => {
    if (!user?._id) return;
    setIsSending(true);
    try {
      const response = await sendFriendRequest(user._id);
      if (response.success || response._id) {
        setRequestSent(true);
        toast.success(`Friend request sent to ${user.fullName}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  // Determine button state
  const getButtonState = () => {
    if (isAlreadyFriend) {
      return { text: "Message", icon: <MessageCircle className="w-4 h-4" />, action: "chat", disabled: false };
    }
    if (requestSent || (isRequestPending && requestDirection === "sent")) {
      return { text: "Request Sent", icon: <Check className="w-4 h-4" />, action: "none", disabled: true };
    }
    if (isRequestPending && requestDirection === "received") {
      return { text: "Respond to Request", icon: <UserPlus className="w-4 h-4" />, action: "respond", disabled: false };
    }
    return { text: "Add Friend", icon: <UserPlus className="w-4 h-4" />, action: "send", disabled: false };
  };

  const buttonState = getButtonState();

  const handleButtonClick = () => {
    if (buttonState.action === "chat") {
      onClose();
    } else if (buttonState.action === "send") {
      handleSendRequest();
    } else if (buttonState.action === "respond") {
      onClose();
      window.location.href = "/notifications";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-base-100 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-base-300 overflow-hidden animate-slideUp">
        
        {/* Header with cover */}
        <div className="relative h-24 bg-gradient-to-r from-primary/20 to-secondary/20">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex justify-center -mt-12 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50"></div>
              <img
                src={user.profilePic || `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${user.fullName}`}
                alt={user.fullName}
                className="relative w-24 h-24 rounded-full object-cover border-4 border-base-100 shadow-lg"
              />
              {user.isPremium && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-base-100">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-base-content">{user.fullName}</h2>
            <p className="text-sm text-base-content/50">@{user.username}</p>
          </div>

          {/* Stats */}
          <div className="flex justify-around py-3 border-y border-base-300 mb-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-base-content">{user.mutualFriendsCount || 0}</p>
              <p className="text-xs text-base-content/50">Mutual Friends</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-base-content">92%</p>
              <p className="text-xs text-base-content/50">Match</p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-4 p-3 bg-base-200 rounded-xl">
              <p className="text-sm text-base-content/80 italic">"{user.bio}"</p>
            </div>
          )}

          {/* Languages */}
          <div className="space-y-3 mb-5">
            {user.nativeLanguage && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Languages className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Native Language</p>
                  <p className="font-medium text-base-content">{user.nativeLanguage}</p>
                </div>
              </div>
            )}
            {user.learningLanguage && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Languages className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Learning Language</p>
                  <p className="font-medium text-base-content">{user.learningLanguage}</p>
                </div>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-base-content/60" />
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Location</p>
                  <p className="font-medium text-base-content">{user.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex gap-3">
            {buttonState.action === "chat" ? (
              <Link
                to={`/chat/${user._id}`}
                onClick={onClose}
                className="flex-1 btn bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl gap-2"
              >
                {buttonState.icon}
                {buttonState.text}
              </Link>
            ) : (
              <button
                onClick={handleButtonClick}
                disabled={buttonState.disabled}
                className={`flex-1 btn rounded-xl gap-2 ${
                  buttonState.action === "send"
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-content"
                    : buttonState.action === "respond"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-green-500/20 text-green-600 cursor-default"
                }`}
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonState.icon}
                {buttonState.text}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default UserProfileModal;