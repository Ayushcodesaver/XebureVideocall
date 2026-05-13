import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router-dom";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, Sparkles, Crown, MessageCircle, Video } from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Premium Header with Xebure Logo - Theme aware */}
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
                  Xebure
                </h1>
                <p className="text-xs text-base-content/50 hidden sm:block">Fresh Connections</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs bg-base-300/50 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-base-content/70">Premium Member</span>
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
          
          {/* Your Friends Section */}
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
              <Link to="/notifications" className="btn btn-primary rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <UsersIcon className="mr-2 size-4" />
                Friend Requests
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
                {friends.map((friend, index) => (
                  <FriendCard key={friend._id} friend={friend} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Meet New Learners Section */}
          <section className="relative">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
                      Meet New Learners
                    </h2>
                  </div>
                  <p className="text-base-content/60">
                    Discover perfect language exchange partners based on your profile
                  </p>
                </div>
                
                {/* Premium Tip */}
                <div className="bg-primary/10 p-3 rounded-xl hidden md:block">
                  <p className="text-xs text-base-content/70 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    Upgrade to Premium for more matches
                  </p>
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              </div>
            ) : recommendedUsers.length === 0 ? (
              <div className="card bg-base-200 p-8 text-center rounded-2xl shadow-lg">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-10 h-10 text-primary/50" />
                </div>
                <h3 className="font-semibold text-xl mb-2 text-base-content">No recommendations available</h3>
                <p className="text-base-content/60">
                  Check back later for new language partners!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedUsers.map((user, index) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                  return (
                    <div
                      key={user._id}
                      className="group bg-base-100 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-base-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Premium Badge for some users */}
                      {index % 3 === 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Crown className="w-3 h-3" />
                            Premium
                          </div>
                        </div>
                      )}
                      
                      <div className="card-body p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full ring-4 ring-primary/20 overflow-hidden shadow-md">
                              <img 
                                src={user.profilePic} 
                                alt={user.fullName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${user.fullName}`;
                                }}
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-base-100"></div>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                              {user.fullName}
                            </h3>
                            {user.location && (
                              <div className="flex items-center text-xs text-base-content/60 mt-1">
                                <MapPinIcon className="size-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Languages with flags */}
                        <div className="flex flex-wrap gap-2">
                          <span className="badge bg-primary/10 text-primary border-none px-3 py-2 rounded-full">
                            {getLanguageFlag(user.nativeLanguage)}
                            <span className="ml-1">Native: {capitialize(user.nativeLanguage)}</span>
                          </span>
                          <span className="badge bg-base-300 text-base-content border-none px-3 py-2 rounded-full">
                            {getLanguageFlag(user.learningLanguage)}
                            <span className="ml-1">Learning: {capitialize(user.learningLanguage)}</span>
                          </span>
                        </div>

                        {user.bio && (
                          <p className="text-sm text-base-content/70 line-clamp-2">{user.bio}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          <button
                            className={`flex-1 btn rounded-xl transition-all duration-300 ${
                              hasRequestBeenSent 
                                ? "btn-disabled" 
                                : "btn-primary shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                            }`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? (
                              <>
                                <CheckCircleIcon className="size-4 mr-2" />
                                Request Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="size-4 mr-2" />
                                Connect
                              </>
                            )}
                          </button>
                          
                          {/* Quick Action Buttons */}
                          <button className="p-2 rounded-xl bg-base-200 hover:bg-primary/10 transition-colors group">
                            <MessageCircle className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors" />
                          </button>
                          <button className="p-2 rounded-xl bg-base-200 hover:bg-primary/10 transition-colors group">
                            <Video className="w-5 h-5 text-base-content/60 group-hover:text-primary transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Premium Call to Action */}
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center">
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary-content mb-2">Upgrade to Premium</h3>
              <p className="text-primary-content/90 mb-6 max-w-md mx-auto">
                Get unlimited matches, video calls, and exclusive themes
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