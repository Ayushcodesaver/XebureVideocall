import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFriendRequests,
  getUserFriends,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../lib/api";
import { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import { 
  UsersIcon, 
  Sparkles, 
  Crown, 
  Check,
  X,
  Loader2
} from "lucide-react";

import NoFriendsFound from "../components/NoFriendsFound";
import UserSearchBar from "../components/UserSearchBar";
import SuggestionsList from "../components/SuggestionsList";
import FriendCard from "../components/FriendCard";
import toast from "react-hot-toast";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [incomingRequestsList, setIncomingRequestsList] = useState([]);

  // ============= 🔥 QUERIES =============
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: incomingRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // ============= 🔥 MUTATIONS =============
  const { mutate: acceptRequestMutation } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend request accepted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept request");
    },
  });

  const { mutate: rejectRequestMutation } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request rejected");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject request");
    },
  });

  // ============= 🔥 UPDATE REQUESTS LIST =============
  useEffect(() => {
    if (incomingRequests?.incomingReqs) {
      setIncomingRequestsList(incomingRequests.incomingReqs);
    }
  }, [incomingRequests]);

  // Handle accept
  const handleAccept = (requestId) => {
    setAcceptingId(requestId);
    acceptRequestMutation(requestId, {
      onSettled: () => setAcceptingId(null),
    });
  };

  // Handle reject
  const handleReject = (requestId) => {
    setRejectingId(requestId);
    rejectRequestMutation(requestId, {
      onSettled: () => setRejectingId(null),
    });
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Premium Header with Xebure Logo */}
      <div className="bg-base-200/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/xebure-logo.png" 
                alt="Xebure" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=48";
                }}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Xebure
                </h1>
                <p className="text-xs text-base-content/50 hidden sm:block">Connect & Learn Languages</p>
              </div>
            </div>
            
            {/* 🔥 SEARCH BAR */}
            <div className="w-full md:w-96">
              <UserSearchBar />
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs bg-base-300/50 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-base-content/70">Premium</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-base-300/50 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                <UsersIcon className="w-3 h-3 text-primary" />
                <span className="text-base-content/70">{friends.length} Friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-12">
          
          {/* ============= 🔥 FRIEND REQUESTS SECTION ============= */}
          {!loadingRequests && incomingRequestsList.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="text-xl font-bold text-base-content">Friend Requests</h2>
                <span className="badge badge-primary badge-sm">{incomingRequestsList.length}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomingRequestsList.map((request) => (
                  <div key={request._id} className="flex items-center gap-3 p-4 bg-base-200 rounded-xl">
                    <img
                      src={request.sender?.profilePic || `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${request.sender?.fullName}`}
                      alt={request.sender?.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-base-content">{request.sender?.fullName}</p>
                      <p className="text-xs text-base-content/50">@{request.sender?.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request._id)}
                        disabled={acceptingId === request._id}
                        className="p-2 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                      >
                        {acceptingId === request._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={rejectingId === request._id}
                        className="p-2 rounded-full bg-red-500/20 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                      >
                        {rejectingId === request._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============= 🔥 SUGGESTIONS SECTION ============= */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-base-content">People You May Know</h2>
            </div>
            <SuggestionsList />
          </div>

          {/* ============= 🔥 YOUR FRIENDS SECTION ============= */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
                  Your Friends
                </h2>
                <p className="text-base-content/60 text-sm mt-1">
                  Connect and chat with your language partners
                </p>
              </div>
              <Link to="/friends" className="btn btn-outline btn-sm rounded-full">
                View All ({friends.length})
              </Link>
            </div>

            {loadingFriends ? (
              <div className="flex justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : friends.length === 0 ? (
              <NoFriendsFound />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {friends.slice(0, 8).map((friend, index) => (
                  <FriendCard key={friend._id} friend={friend} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Premium Call to Action */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-center">
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary-content mb-2">Upgrade to Premium</h3>
              <p className="text-primary-content/90 mb-6 max-w-md mx-auto">
                Get unlimited matches, video calls, and exclusive features
              </p>
              <button className="bg-base-100 text-primary px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                Learn More →
              </button>
            </div>
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

export default HomePage;