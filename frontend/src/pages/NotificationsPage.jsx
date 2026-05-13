import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { 
  BellIcon, 
  ClockIcon, 
  MessageSquareIcon, 
  UserCheckIcon, 
  Sparkles,
  Crown,
  Heart,
  UserPlus,
  CheckCircle,
  XCircle,
  Award
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { useState } from "react";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState(null);

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend request accepted! 🎉");
      setAcceptingId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept request");
      setAcceptingId(null);
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const handleAcceptRequest = (requestId) => {
    setAcceptingId(requestId);
    acceptRequestMutation(requestId);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Premium Header with Logo - Theme aware */}
      <div className="bg-base-200/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
                  Notifications
                </h1>
                <p className="text-xs text-base-content/50 hidden sm:block">Stay updated with Xebure</p>
              </div>
            </div>
            
            {/* Premium Stats - Theme aware */}
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 px-3 py-1.5 rounded-full hidden md:flex items-center gap-2">
                <BellIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-base-content/70">
                  {incomingRequests.length + acceptedRequests.length} Updates
                </span>
              </div>
              <div className="bg-yellow-500/10 px-2 py-1 rounded-full">
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-5xl space-y-8">
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Incoming Friend Requests Section */}
              {incomingRequests.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                        <UserPlus className="h-5 w-5 text-primary-content" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-base-content">
                          Friend Requests
                        </h2>
                        <p className="text-sm text-base-content/60">People who want to connect with you</p>
                      </div>
                    </div>
                    <div className="badge bg-gradient-to-r from-primary to-secondary text-primary-content border-none px-3 py-2 text-sm">
                      {incomingRequests.length} New
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {incomingRequests.map((request, idx) => (
                      <div
                        key={request._id}
                        className="group bg-base-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-base-300"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              {/* Premium Avatar with Ring - Theme aware */}
                              <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary p-0.5">
                                  <div className="w-full h-full rounded-full bg-base-100 overflow-hidden">
                                    <img 
                                      src={request.sender.profilePic} 
                                      alt={request.sender.fullName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${request.sender.fullName}`;
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-base-100"></div>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                                    {request.sender.fullName}
                                  </h3>
                                  {/* Premium Badge */}
                                  {idx % 2 === 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                                      <Award className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs text-yellow-600">Verified</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="badge bg-primary/10 text-primary border-none px-3 py-1.5 rounded-full">
                                    Native: {request.sender.nativeLanguage}
                                  </span>
                                  <span className="badge bg-base-300 text-base-content border-none px-3 py-1.5 rounded-full">
                                    Learning: {request.sender.learningLanguage}
                                  </span>
                                </div>
                                
                                {request.sender.bio && (
                                  <p className="text-sm text-base-content/60 mt-2 line-clamp-1">
                                    {request.sender.bio}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons - Theme aware */}
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                className="flex-1 sm:flex-none btn bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-content border-none rounded-xl px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                onClick={() => handleAcceptRequest(request._id)}
                                disabled={isPending && acceptingId === request._id}
                              >
                                {isPending && acceptingId === request._id ? (
                                  <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span>
                                    Accepting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept
                                  </>
                                )}
                              </button>
                              <button className="btn bg-base-200 hover:bg-base-300 text-base-content border-none rounded-xl px-4">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Accepted Requests Notifications - Theme aware */}
              {acceptedRequests.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-base-content">
                        New Connections
                      </h2>
                      <p className="text-sm text-base-content/60">People who accepted your requests</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {acceptedRequests.map((notification) => (
                      <div
                        key={notification._id}
                        className="group bg-green-50 dark:bg-green-950/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-green-100 dark:border-green-900"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-green-400">
                                <img
                                  src={notification.recipient.profilePic}
                                  alt={notification.recipient.fullName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${notification.recipient.fullName}`;
                                  }}
                                />
                              </div>
                              <div className="absolute -top-1 -right-1">
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-base-content">
                                    {notification.recipient.fullName}
                                  </h3>
                                  <p className="text-sm text-base-content/70 mt-0.5">
                                    accepted your friend request
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="badge bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-none">
                                    <MessageSquareIcon className="h-3 w-3 mr-1" />
                                    New Friend
                                  </div>
                                  <button className="btn btn-xs bg-gradient-to-r from-primary to-secondary text-primary-content border-none rounded-lg">
                                    Message
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-base-content/50 flex items-center gap-1 mt-2">
                                <ClockIcon className="h-3 w-3" />
                                Just now
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State - Theme aware */}
              {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                      <BellIcon className="w-12 h-12 text-primary/40" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                  <NoNotificationsFound />
                  <button className="mt-6 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
                    Find Friends →
                  </button>
                </div>
              )}

              {/* Premium Tip Section - Theme aware */}
              {(incomingRequests.length > 0 || acceptedRequests.length > 0) && (
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mt-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <p className="text-sm text-base-content/70">
                      <span className="font-semibold text-primary">Premium Tip:</span> Connect with friends to unlock video calls and language exchange features!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
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

export default NotificationsPage;