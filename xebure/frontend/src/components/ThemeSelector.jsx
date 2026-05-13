import { PaletteIcon, Sparkles, CheckCircle, Crown, Search } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { useState } from "react";
import toast from "react-hot-toast";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredThemes = THEMES.filter(themeOption =>
    themeOption.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    const selectedTheme = THEMES.find(t => t.name === themeName);
    toast.success(`${selectedTheme?.label} theme applied! 🎨`);
    setIsOpen(false);
  };

  const isPremiumTheme = (themeName) => {
    const premiumThemes = ["mintlatte", "cyberpunk", "synthwave", "luxury", "dracula"];
    return premiumThemes.includes(themeName);
  };

  return (
    <div className="dropdown dropdown-end">
      {/* PREMIUM DROPDOWN TRIGGER */}
      <button 
        tabIndex={0} 
        className="relative group btn btn-ghost btn-circle hover:bg-gradient-to-r hover:from-[#00A19B]/10 hover:to-[#00837e]/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        <PaletteIcon className="size-5 text-gray-600 group-hover:text-[#00A19B] transition-colors relative z-10" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-[#00A19B] to-[#00837e] rounded-full animate-pulse"></div>
      </button>

      {/* PREMIUM DROPDOWN MENU */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn lg:absolute lg:inset-auto lg:mt-2 lg:right-0 lg:top-full lg:bg-transparent">
          <div 
            className="relative w-full max-w-md mx-4 lg:mx-0 lg:w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#00A19B]/20 overflow-hidden animate-slideUp"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00A19B] to-[#00837e] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PaletteIcon className="w-5 h-5" />
                  <h3 className="font-semibold">Premium Themes</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/80 text-xs mt-1">32+ stunning themes to match your mood</p>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-8 text-sm border border-gray-200 rounded-xl focus:border-[#00A19B] focus:ring-2 focus:ring-[#00A19B]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Themes List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {/* Premium Section Badge */}
              <div className="flex items-center gap-2 px-3 py-2">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Premium Collection</span>
                <Sparkles className="w-3 h-3 text-yellow-500" />
              </div>

              {filteredThemes.map((themeOption) => {
                const isActive = theme === themeOption.name;
                const isPremium = isPremiumTheme(themeOption.name);
                
                return (
                  <button
                    key={themeOption.name}
                    className={`
                      w-full group relative px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300
                      ${isActive 
                        ? "bg-gradient-to-r from-[#00A19B]/10 to-[#00837e]/10 border-l-4 border-[#00A19B]" 
                        : "hover:bg-gray-50 hover:scale-[1.02]"
                      }
                    `}
                    onClick={() => handleThemeChange(themeOption.name)}
                  >
                    {/* Premium Badge */}
                    {isPremium && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                          <Crown className="w-2 h-2" />
                          <span>PRO</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Theme Icon with Gradient */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-r from-[#00A19B] to-[#00837e] shadow-md" 
                        : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-[#00A19B]/20 group-hover:to-[#00837e]/20"
                    }`}>
                      <PaletteIcon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500 group-hover:text-[#00A19B]"}`} />
                    </div>
                    
                    {/* Theme Name */}
                    <span className={`text-sm font-medium flex-1 text-left ${
                      isActive ? "text-[#00A19B]" : "text-gray-700"
                    }`}>
                      {themeOption.label}
                    </span>
                    
                    {/* Theme Preview Colors */}
                    <div className="flex gap-1">
                      {themeOption.colors.slice(0, 3).map((color, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/50 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    {/* Active Checkmark */}
                    {isActive && (
                      <CheckCircle className="w-4 h-4 text-[#00A19B] ml-1" />
                    )}
                  </button>
                );
              })}

              {filteredThemes.length === 0 && (
                <div className="text-center py-8">
                  <PaletteIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No themes found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-500">32+ themes available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-gray-400">Live Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ThemeSelector;