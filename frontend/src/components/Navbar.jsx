import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, HomeIcon, Sparkles } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import FontSelector from "./FontSelector";
import useLogout from "../hooks/useLogout";
import { useState } from "react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { logoutMutation } = useLogout();

  const handleLogout = () => {
    logoutMutation();
    toast.success("Logged out successfully 👋");
  };

  const navLinks = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/notifications", icon: BellIcon, label: "Notifications" },
  ];

  return (
    <>
      <nav className="bg-base-200/95 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LEFT SECTION - Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <img 
                    src="/xebure-logo.png" 
                    alt="Xebure" 
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg relative z-10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=36";
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
                    Xebure
                  </span>
                  <span className="text-[10px] text-base-content/40 block -mt-1">Premium</span>
                </div>
              </Link>
              
              {/* Divider */}
              <div className="h-8 w-px bg-base-300 mx-2 hidden md:block"></div>
              
              {/* Navigation Links - Desktop */}
              {!isChatPage && (
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                        location.pathname === link.path
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-base-content/70 hover:bg-base-300 hover:text-primary"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      <span className="text-sm">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SECTION - User Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Premium Badge - Desktop */}
              <div className="hidden lg:flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-yellow-600 font-medium">Premium</span>
              </div>

              {/* Notifications Button */}
              <Link to="/notifications" className="relative">
                <button className="btn btn-ghost btn-circle relative hover:bg-primary/10 transition-all duration-300">
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content/70 hover:text-primary transition-colors" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
              </Link>

              {/* Font Selector */}
              <FontSelector />

              {/* Theme Selector */}
              <ThemeSelector />

              {/* User Avatar */}
              <Link to="/" className="relative group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300 relative z-10 overflow-hidden">
                    <img 
                      src={authUser?.profilePic || "https://ui-avatars.com/api/?background=00A19B&color=fff&name=User"} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-base-100"></div>
                </div>
              </Link>

              {/* Logout Button */}
              <button 
                className="btn btn-ghost btn-circle hover:bg-red-500/10 transition-all duration-300 group"
                onClick={handleLogout}
              >
                <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content/70 group-hover:text-red-500 transition-colors" />
              </button>

              {/* Mobile Menu Button */}
              {!isChatPage && (
                <button 
                  className="md:hidden btn btn-ghost btn-circle"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <svg className="w-6 h-6 text-base-content/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {!isChatPage && isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-base-200/95 backdrop-blur-md border-b border-base-300 shadow-lg z-40 animate-slideDown">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-2">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <img 
                    src={authUser?.profilePic || "https://ui-avatars.com/api/?background=00A19B&color=fff&name=User"} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-base-content">{authUser?.fullName || "User"}</p>
                  <p className="text-xs text-base-content/60">{authUser?.email || "user@xebure.com"}</p>
                </div>
              </div>
              
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-base-content/70 hover:bg-base-300"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* Font Selector in Mobile Menu */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-base-300 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary text-sm">Aa</span>
                  </div>
                  <span className="text-sm text-base-content/70">Font Style</span>
                </div>
                <FontSelector />
              </div>
              
              {/* Theme Selector in Mobile Menu */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary text-sm">🎨</span>
                  </div>
                  <span className="text-sm text-base-content/70">Theme Color</span>
                </div>
                <ThemeSelector />
              </div>
              
              {/* Mobile Premium Badge */}
              <div className="flex items-center justify-between px-4 py-2 mt-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-base-content/70">Premium Member</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;