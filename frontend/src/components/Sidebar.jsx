import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { 
  BellIcon, 
  HomeIcon, 
  UsersIcon, 
  Crown,
  Sparkles,
  LogOutIcon
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import useLogout from "../hooks/useLogout";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logoutMutation } = useLogout();

  const handleLogout = () => {
    logoutMutation();
    toast.success("Logged out successfully 👋");
  };

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Home" },
    { path: "/friends", icon: UsersIcon, label: "Friends" },
    { path: "/chats", icon: BellIcon, label: "Chats" },
    { path: "/notifications", icon: BellIcon, label: "Notifications" },
  ];

  return (
    <>
      {/* Desktop Sidebar - Theme aware */}
      <aside 
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-base-200/95 backdrop-blur-md border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0 shadow-xl transition-all duration-300 z-30`}
      >
        {/* Logo Section - Theme aware */}
        <div className={`p-5 border-b border-base-300 ${isCollapsed ? "px-3" : ""}`}>
          <Link to="/" className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <img 
                src="/xebure-logo.png" 
                alt="Xebure" 
                className="w-9 h-9 object-contain rounded-xl relative z-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?background=00A19B&color=fff&name=X&size=36";
                }}
              />
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
                  Xebure
                </span>
                <span className="text-[10px] text-base-content/40 block -mt-1">Premium</span>
              </div>
            )}
          </Link>
        </div>

        {/* Collapse Toggle Button - Theme aware */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-base-100 border border-base-300 rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>

        {/* Navigation - Theme aware */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === "/chats" && currentPath?.startsWith("/chat"));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-content shadow-md"
                    : "text-base-content/70 hover:bg-primary/10 hover:text-primary"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-content" : "group-hover:text-primary"} transition-colors`} />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 bg-primary-content rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Premium Upgrade Banner - Theme aware */}
        {!isCollapsed && (
          <div className="mx-4 mb-3">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-3 text-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <div className="relative z-10">
                <Crown className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
                <p className="text-primary-content text-xs font-semibold">Upgrade to Pro</p>
                <p className="text-primary-content/80 text-[10px]">Get unlimited features</p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Section - Theme aware */}
        <div className={`p-4 border-t border-base-300 ${isCollapsed ? "px-2" : ""}`}>
          <div className={`flex ${isCollapsed ? "justify-center" : "items-center gap-3"}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-300 relative z-10 overflow-hidden">
                <img 
                  src={authUser?.profilePic || "https://ui-avatars.com/api/?background=00A19B&color=fff&name=User"} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100"></div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1">
                <p className="font-semibold text-sm text-base-content line-clamp-1">{authUser?.fullName || "User"}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Online
                </p>
              </div>
            )}
            
            {!isCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors group"
                title="Logout"
              >
                <LogOutIcon className="w-4 h-4 text-base-content/50 group-hover:text-red-500 transition-colors" />
              </button>
            )}
          </div>
          
          {/* Collapsed Logout Button - Theme aware */}
          {isCollapsed && (
            <button 
              onClick={handleLogout}
              className="mt-3 w-full p-2 rounded-lg hover:bg-red-500/10 transition-colors group flex justify-center"
              title="Logout"
            >
              <LogOutIcon className="w-5 h-5 text-base-content/50 group-hover:text-red-500 transition-colors" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;