import { LoaderIcon, Sparkles } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const { theme } = useThemeStore();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E4DDD3] via-[#f5f2ed] to-[#00A19B]/10 relative overflow-hidden" 
      data-theme={theme}
    >
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00A19B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E4DDD3] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00837e] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
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

      {/* Main Loader Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* Logo with Animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-2xl blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <img 
              src="/xebure-logo.png" 
              alt="Xebure" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=80";
              }}
            />
          </div>
        </div>

        {/* Premium Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#00A19B]/20 border-t-[#00A19B] border-r-[#00837e] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#00A19B] to-[#00837e] bg-clip-text text-transparent animate-pulse">
            Xebure
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 justify-center">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            Loading your experience
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </p>
        </div>

        {/* Loading Tips */}
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            Premium features loading
            <Sparkles className="w-3 h-3" />
          </p>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-twinkle {
          animation: twinkle infinite ease-in-out;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;