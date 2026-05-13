import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ✅ ORIGINAL LOGIC - NOT CHANGED
  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    signupMutation(signupData); // ✅ ORIGINAL - NOT CHANGED
  };

  // Password strength checker - VISUAL ONLY
  const getPasswordStrength = () => {
    const pwd = signupData.password;
    if (pwd.length === 0) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length >= 6 && !/[A-Z]/.test(pwd)) return 2;
    if (pwd.length >= 6 && /[A-Z]/.test(pwd) && /\d/.test(pwd)) return 3;
    return 4;
  };

  const strength = getPasswordStrength();
  const strengthText = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E4DDD3] via-[#f5f2ed] to-[#00A19B]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00A19B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#E4DDD3] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00837e] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
            <Sparkles className="w-2 h-2 text-[#00A19B] opacity-50" />
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="border border-white/20 backdrop-blur-sm flex flex-col lg:flex-row w-full bg-white/95 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,161,155,0.3)]">
          
          {/* SIGNUP FORM SECTION */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col">
            {/* LOGO - LARGER SIZE */}
            <div className="mb-8 flex flex-col items-center sm:items-start justify-center gap-3">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <img 
                  src="/xebure-logo.png" 
                  alt="Xebure" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl shadow-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=80";
                  }}
                />
                <div className="text-left">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00A19B] to-[#00837e] tracking-tight">
                    Xebure
                  </span>
                  <p className="text-sm text-gray-500 -mt-1">Join the Community</p>
                </div>
              </div>
            </div>

            {/* ERROR MESSAGE DISPLAY - ORIGINAL LOGIC */}
            {error && (
              <div className="alert alert-error mb-4 rounded-xl shadow-lg animate-shake bg-red-50 border-red-200 text-red-700">
                <span>{error.response?.data?.message || "Signup failed. Please try again."}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleSignup}>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Create Account
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Join Xebure and start your language learning adventure!
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Full Name Field */}
                    <div className="form-control w-full space-y-2">
                      <label className="label px-1">
                        <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#00A19B]" />
                          Full Name
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered w-full rounded-xl border-gray-200 focus:border-[#00A19B] focus:ring-2 focus:ring-[#00A19B]/20 transition-all duration-300 pl-4 py-3"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div className="form-control w-full space-y-2">
                      <label className="label px-1">
                        <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#00A19B]" />
                          Email Address
                        </span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="input input-bordered w-full rounded-xl border-gray-200 focus:border-[#00A19B] focus:ring-2 focus:ring-[#00A19B]/20 transition-all duration-300 pl-4 py-3"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>

                    {/* Password Field with Strength Meter */}
                    <div className="form-control w-full space-y-2">
                      <label className="label px-1">
                        <span className="label-text font-medium text-gray-700 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#00A19B]" />
                          Password
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="input input-bordered w-full rounded-xl border-gray-200 focus:border-[#00A19B] focus:ring-2 focus:ring-[#00A19B]/20 transition-all duration-300 pl-4 py-3 pr-12"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00A19B] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Meter */}
                      {signupData.password.length > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 h-1.5">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  strength >= level ? strengthColor[strength] : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs mt-1 ${strength >= 3 ? "text-green-600" : strength >= 2 ? "text-yellow-600" : "text-gray-500"}`}>
                            {strength > 0 ? strengthText[strength] : "Enter a password"} 
                            {strength === 1 && " (min. 6 characters)"}
                            {strength === 2 && " (add uppercase for strong)"}
                            {strength >= 3 && " ✓ Strong password!"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-sm rounded border-gray-300 checked:bg-[#00A19B] checked:border-[#00A19B]" 
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          required 
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the{" "}
                          <span className="text-[#00A19B] hover:text-[#00837e] font-medium hover:underline cursor-pointer">Terms of Service</span>{" "}
                          and{" "}
                          <span className="text-[#00A19B] hover:text-[#00837e] font-medium hover:underline cursor-pointer">Privacy Policy</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button - ORIGINAL LOGIC PRESERVED */}
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-[#00A19B] to-[#00837e] hover:from-[#00837e] hover:to-[#00A19B] text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  {/* Sign In Link */}
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link to="/login" className="text-[#00A19B] hover:text-[#00837e] font-semibold hover:underline transition-all">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE - Premium Features Showcase */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-[#00A19B]/5 to-[#E4DDD3]/20 items-center justify-center relative overflow-hidden">
            <div className="max-w-md p-8 relative z-10">
              <div className="relative aspect-square max-w-sm mx-auto">
                <img src="/i.png" alt="Language connection illustration" className="w-full h-full object-contain drop-shadow-2xl" />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00A19B] to-[#00837e] text-white text-xs px-3 py-1 rounded-full shadow-lg">
                  Join Free
                </div>
              </div>

              <div className="text-center space-y-3 mt-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00A19B] to-[#00837e] bg-clip-text text-transparent">
                  Start Your Journey
                </h2>
                <p className="text-gray-600">
                  Get access to amazing features when you sign up
                </p>
                
                <div className="flex flex-col gap-3 mt-4 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-600 group hover:translate-x-1 transition-transform">
                    <CheckCircle className="w-4 h-4 text-[#00A19B]" />
                    <span>Connect with global language partners</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 group hover:translate-x-1 transition-transform">
                    <CheckCircle className="w-4 h-4 text-[#00A19B]" />
                    <span>1-on-1 & Group Video Calls</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 group hover:translate-x-1 transition-transform">
                    <CheckCircle className="w-4 h-4 text-[#00A19B]" />
                    <span>Real-time Chat Translation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 group hover:translate-x-1 transition-transform">
                    <CheckCircle className="w-4 h-4 text-[#00A19B]" />
                    <span>32+ Premium Themes</span>
                  </div>
                </div>

                <div className="flex justify-around mt-6 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xl font-bold text-[#00A19B]">10K+</div>
                    <div className="text-xs text-gray-500">Active Users</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#00A19B]">50+</div>
                    <div className="text-xs text-gray-500">Countries</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#00A19B]">14</div>
                    <div className="text-xs text-gray-500">Languages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;