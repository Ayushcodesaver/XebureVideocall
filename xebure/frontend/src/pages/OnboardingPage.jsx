import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { 
  LoaderIcon, 
  MapPinIcon, 
  ShuffleIcon, 
  Sparkles,
  CameraIcon,
  Globe,
  MessageCircle,
  User,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const [currentStep, setCurrentStep] = useState(1);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully! Welcome to Xebure ✨");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`;
    
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated! 🎨");
  };

  const nextStep = () => {
    if (currentStep === 1 && !formState.fullName) {
      toast.error("Please enter your full name");
      return;
    }
    if (currentStep === 2 && (!formState.nativeLanguage || !formState.learningLanguage)) {
      toast.error("Please select your languages");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Premium Animated Background - Theme aware */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/50 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Sparkles className="w-2 h-2 text-primary opacity-50" />
          </div>
        ))}
      </div>

      {/* Main Container - Theme aware */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-base-100/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-base-300">
          
          {/* Header with Logo - Theme aware */}
          <div className="bg-gradient-to-r from-primary to-secondary px-6 sm:px-8 py-6 text-primary-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/xebure-logo.png" 
                  alt="Xebure" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl bg-white/20 p-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=48";
                  }}
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">Welcome to Xebure</h1>
                  <p className="text-primary-content/80 text-sm">Let's set up your profile</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm">Premium Setup</span>
              </div>
            </div>
          </div>

          {/* Progress Steps - Theme aware */}
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      currentStep >= step 
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg" 
                        : "bg-base-300 text-base-content/50"
                    }`}>
                      {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`absolute top-5 left-10 w-full h-0.5 transition-all duration-300 ${
                        currentStep > step ? "bg-gradient-to-r from-primary to-secondary" : "bg-base-300"
                      }`} style={{ width: 'calc(100% - 2rem)' }}></div>
                    )}
                  </div>
                  <span className={`text-xs ml-2 hidden sm:block ${
                    currentStep >= step ? "text-primary font-medium" : "text-base-content/50"
                  }`}>
                    {step === 1 && "Profile"}
                    {step === 2 && "Languages"}
                    {step === 3 && "Bio & Location"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-body p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: Profile Picture & Name - Theme aware */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-secondary p-1">
                        <div className="w-full h-full rounded-full bg-base-100 overflow-hidden">
                          {formState.profilePic ? (
                            <img
                              src={formState.profilePic}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-base-200">
                              <CameraIcon className="w-12 h-12 text-base-content/40" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-secondary rounded-full p-1">
                        <CameraIcon className="w-4 h-4 text-primary-content" />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleRandomAvatar} 
                      className="btn bg-primary/10 text-primary border-none rounded-xl hover:shadow-lg transition-all"
                    >
                      <ShuffleIcon className="size-4 mr-2" />
                      Generate Random Avatar
                    </button>
                    <p className="text-xs text-base-content/50">Or upload your own photo later</p>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formState.fullName}
                      onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                      className="input input-bordered w-full rounded-xl border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Languages - Theme aware */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-4">
                    <Globe className="w-12 h-12 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-base-content">Language Settings</h3>
                    <p className="text-sm text-base-content/60">Tell us about your language journey</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">Native Language</span>
                      </label>
                      <select
                        name="nativeLanguage"
                        value={formState.nativeLanguage}
                        onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                        className="select select-bordered w-full rounded-xl border-base-300 focus:border-primary"
                      >
                        <option value="">Select your native language</option>
                        {LANGUAGES.map((lang) => (
                          <option key={`native-${lang}`} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">Learning Language</span>
                      </label>
                      <select
                        name="learningLanguage"
                        value={formState.learningLanguage}
                        onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                        className="select select-bordered w-full rounded-xl border-base-300 focus:border-primary"
                      >
                        <option value="">Select language you're learning</option>
                        {LANGUAGES.map((lang) => (
                          <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Bio & Location - Theme aware */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        Bio
                      </span>
                    </label>
                    <textarea
                      name="bio"
                      value={formState.bio}
                      onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                      className="textarea textarea-bordered rounded-xl h-28 border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Tell others about yourself and your language learning goals..."
                    />
                    <p className="text-xs text-base-content/40 mt-1">
                      {formState.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-primary" />
                        Location
                      </span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 w-5 h-5 text-base-content/40" />
                      <input
                        type="text"
                        name="location"
                        value={formState.location}
                        onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                        className="input input-bordered w-full rounded-xl pl-10 border-base-300 focus:border-primary"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Theme aware */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 btn bg-base-200 hover:bg-base-300 text-base-content border-none rounded-xl"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 btn bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-content border-none rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button 
                    className="flex-1 btn bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-content border-none rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]" 
                    disabled={isPending} 
                    type="submit"
                  >
                    {!isPending ? (
                      <>
                        <CheckCircle className="size-5 mr-2" />
                        Complete Onboarding
                      </>
                    ) : (
                      <>
                        <LoaderIcon className="animate-spin size-5 mr-2" />
                        Onboarding...
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Premium Footer - Theme aware */}
          <div className="bg-base-200 px-6 sm:px-8 py-4 border-t border-base-300">
            <p className="text-xs text-base-content/40 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              Complete your profile to unlock all Xebure features
              <Sparkles className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;