import { TypeIcon, Sparkles, CheckCircle, Search } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// 32+ Premium Fonts with Google Fonts
const FONTS = [
  // ========== SANS-SERIF FONTS (16) ==========
  { 
    name: "inter", 
    label: "Inter", 
    fontFamily: "'Inter', sans-serif", 
    category: "Sans-serif",
    description: "Clean, modern, highly readable"
  },
  { 
    name: "poppins", 
    label: "Poppins", 
    fontFamily: "'Poppins', sans-serif", 
    category: "Sans-serif",
    description: "Geometric, friendly and modern"
  },
  { 
    name: "roboto", 
    label: "Roboto", 
    fontFamily: "'Roboto', sans-serif", 
    category: "Sans-serif",
    description: "Professional and versatile"
  },
  { 
    name: "open-sans", 
    label: "Open Sans", 
    fontFamily: "'Open Sans', sans-serif", 
    category: "Sans-serif",
    description: "Humanist, neutral and friendly"
  },
  { 
    name: "montserrat", 
    label: "Montserrat", 
    fontFamily: "'Montserrat', sans-serif", 
    category: "Sans-serif",
    description: "Urban, elegant and bold"
  },
  { 
    name: "lato", 
    label: "Lato", 
    fontFamily: "'Lato', sans-serif", 
    category: "Sans-serif",
    description: "Warm, serious but friendly"
  },
  { 
    name: "nunito", 
    label: "Nunito", 
    fontFamily: "'Nunito', sans-serif", 
    category: "Sans-serif",
    description: "Rounded, friendly, balanced"
  },
  { 
    name: "quicksand", 
    label: "Quicksand", 
    fontFamily: "'Quicksand', sans-serif", 
    category: "Sans-serif",
    description: "Light, airy, geometric"
  },
  { 
    name: "rubik", 
    label: "Rubik", 
    fontFamily: "'Rubik', sans-serif", 
    category: "Sans-serif",
    description: "Clean, rounded, modern"
  },
  { 
    name: "work-sans", 
    label: "Work Sans", 
    fontFamily: "'Work Sans', sans-serif", 
    category: "Sans-serif",
    description: "Neutral, crisp, minimalist"
  },
  { 
    name: "source-sans", 
    label: "Source Sans", 
    fontFamily: "'Source Sans 3', sans-serif", 
    category: "Sans-serif",
    description: "Professional, Adobe original"
  },
  { 
    name: "ubuntu", 
    label: "Ubuntu", 
    fontFamily: "'Ubuntu', sans-serif", 
    category: "Sans-serif",
    description: "Distinctive, modern, humanist"
  },
  { 
    name: "raleway", 
    label: "Raleway", 
    fontFamily: "'Raleway', sans-serif", 
    category: "Sans-serif",
    description: "Elegant, thin, sophisticated"
  },
  { 
    name: "dm-sans", 
    label: "DM Sans", 
    fontFamily: "'DM Sans', sans-serif", 
    category: "Sans-serif",
    description: "Low-contrast, geometric"
  },
  { 
    name: "josefin-sans", 
    label: "Josefin Sans", 
    fontFamily: "'Josefin Sans', sans-serif", 
    category: "Sans-serif",
    description: "Geometric, vintage feel"
  },
  { 
    name: "manrope", 
    label: "Manrope", 
    fontFamily: "'Manrope', sans-serif", 
    category: "Sans-serif",
    description: "Modern, semi-condensed"
  },

  // ========== SERIF FONTS (8) ==========
  { 
    name: "playfair", 
    label: "Playfair Display", 
    fontFamily: "'Playfair Display', serif", 
    category: "Serif",
    description: "Elegant, sophisticated, timeless"
  },
  { 
    name: "merriweather", 
    label: "Merriweather", 
    fontFamily: "'Merriweather', serif", 
    category: "Serif",
    description: "Classic, readable, warm"
  },
  { 
    name: "lora", 
    label: "Lora", 
    fontFamily: "'Lora', serif", 
    category: "Serif",
    description: "Balanced, contemporary, readable"
  },
  { 
    name: "cormorant", 
    label: "Cormorant", 
    fontFamily: "'Cormorant', serif", 
    category: "Serif",
    description: "Elegant, luxurious, bookish"
  },
  { 
    name: "crimson-text", 
    label: "Crimson Text", 
    fontFamily: "'Crimson Text', serif", 
    category: "Serif",
    description: "Traditional, classic, old-style"
  },
  { 
    name: "libre-baskerville", 
    label: "Libre Baskerville", 
    fontFamily: "'Libre Baskerville', serif", 
    category: "Serif",
    description: "Elegant, classic, bookish"
  },
  { 
    name: "pt-serif", 
    label: "PT Serif", 
    fontFamily: "'PT Serif', serif", 
    category: "Serif",
    description: "Universal, reliable, readable"
  },
  { 
    name: "cardo", 
    label: "Cardo", 
    fontFamily: "'Cardo', serif", 
    category: "Serif",
    description: "Classic, elegant, scholarly"
  },

  // ========== MONOSPACE FONTS (6) ==========
  { 
    name: "source-code", 
    label: "Source Code Pro", 
    fontFamily: "'Source Code Pro', monospace", 
    category: "Monospace",
    description: "Perfect for coding and technical text"
  },
  { 
    name: "fira-code", 
    label: "Fira Code", 
    fontFamily: "'Fira Code', monospace", 
    category: "Monospace",
    description: "Programming ligatures included"
  },
  { 
    name: "jetbrains-mono", 
    label: "JetBrains Mono", 
    fontFamily: "'JetBrains Mono', monospace", 
    category: "Monospace",
    description: "Developer-focused, highly readable"
  },
  { 
    name: "courier-prime", 
    label: "Courier Prime", 
    fontFamily: "'Courier Prime', monospace", 
    category: "Monospace",
    description: "Classic typewriter feel"
  },
  { 
    name: "inconsolata", 
    label: "Inconsolata", 
    fontFamily: "'Inconsolata', monospace", 
    category: "Monospace",
    description: "Clean, modern monospace"
  },
  { 
    name: "roboto-mono", 
    label: "Roboto Mono", 
    fontFamily: "'Roboto Mono', monospace", 
    category: "Monospace",
    description: "Geometric, professional"
  },

  // ========== DISPLAY/HANDWRITING FONTS (6) ==========
  { 
    name: "caveat", 
    label: "Caveat", 
    fontFamily: "'Caveat', cursive", 
    category: "Handwriting",
    description: "Handwritten, casual, friendly"
  },
  { 
    name: "dancing-script", 
    label: "Dancing Script", 
    fontFamily: "'Dancing Script', cursive", 
    category: "Handwriting",
    description: "Elegant, flowing script"
  },
  { 
    name: "pacifico", 
    label: "Pacifico", 
    fontFamily: "'Pacifico', cursive", 
    category: "Display",
    description: "Fun, retro, bold"
  },
  { 
    name: "permanent-marker", 
    label: "Permanent Marker", 
    fontFamily: "'Permanent Marker', cursive", 
    category: "Display",
    description: "Bold, marker-style"
  },
  { 
    name: "fredoka", 
    label: "Fredoka", 
    fontFamily: "'Fredoka', sans-serif", 
    category: "Display",
    description: "Fun, rounded, friendly"
  },
  { 
    name: "righteous", 
    label: "Righteous", 
    fontFamily: "'Righteous', cursive", 
    category: "Display",
    description: "Bold, geometric display"
  },
];

// Category colors for icons
const categoryColors = {
  "Sans-serif": "from-blue-500 to-cyan-500",
  "Serif": "from-amber-500 to-orange-500",
  "Monospace": "from-purple-500 to-pink-500",
  "Handwriting": "from-emerald-500 to-teal-500",
  "Display": "from-rose-500 to-red-500",
};

// Category icons
const categoryIcons = {
  "Sans-serif": "Aa",
  "Serif": "Aa",
  "Monospace": "</>",
  "Handwriting": "✍️",
  "Display": "🎨",
};

const FontSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentFont, setCurrentFont] = useState("inter");

  // Load saved font on mount
  useEffect(() => {
    const savedFont = localStorage.getItem("xebure-font");
    if (savedFont) {
      const font = FONTS.find(f => f.name === savedFont);
      if (font) {
        setCurrentFont(savedFont);
        document.documentElement.style.setProperty('--font-family', font.fontFamily);
        document.body.style.fontFamily = font.fontFamily;
      }
    }
  }, []);

  const handleFontChange = (fontName, fontFamily) => {
    // Save to localStorage
    localStorage.setItem("xebure-font", fontName);
    // Apply font to document
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.body.style.fontFamily = fontFamily;
    // Update state
    setCurrentFont(fontName);
    // Show success message
    const fontLabel = FONTS.find(f => f.name === fontName)?.label;
    toast.success(`${fontLabel} font applied! ✨`);
    setIsOpen(false);
  };

  // Filter fonts based on search and category
  const filteredFonts = FONTS.filter(f => {
    const matchesSearch = f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter tabs
  const categories = ["All", ...new Set(FONTS.map(f => f.category))];

  return (
    <div className="dropdown dropdown-end">
      {/* Font Selector Button */}
      <button
        tabIndex={0}
        className="relative group btn btn-ghost btn-circle hover:bg-primary/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        <TypeIcon className="size-5 text-base-content/70 group-hover:text-primary transition-colors relative z-10" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn lg:absolute lg:inset-auto lg:mt-2 lg:right-0 lg:top-full lg:bg-transparent">
          <div className="relative w-full max-w-2xl mx-4 lg:mx-0 lg:w-[600px] bg-base-100/95 backdrop-blur-md rounded-2xl shadow-2xl border border-base-300 overflow-hidden animate-slideUp">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-5 py-4 text-primary-content">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-5 h-5" />
                  <h3 className="font-semibold">Premium Fonts</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-primary-content/80 text-xs mt-1">{FONTS.length}+ stunning fonts to match your style</p>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-base-300">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-8 text-sm border border-base-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-base-100 text-base-content"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 p-2 border-b border-base-300 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 whitespace-nowrap ${
                    activeCategory === category
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content/60 hover:bg-base-200"
                  }`}
                >
                  {category}
                  {category !== "All" && (
                    <span className="ml-1 text-[10px] opacity-70">
                      ({FONTS.filter(f => f.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Fonts List */}
            <div className="max-h-[500px] overflow-y-auto p-3 space-y-2">
              {filteredFonts.length === 0 ? (
                <div className="text-center py-12">
                  <TypeIcon className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-sm text-base-content/50">No fonts found</p>
                  <p className="text-xs text-base-content/40 mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredFonts.map((fontOption) => {
                  const isActive = currentFont === fontOption.name;
                  
                  return (
                    <button
                      key={fontOption.name}
                      className={`
                        w-full group px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-300
                        ${isActive 
                          ? "bg-primary/10 border-l-4 border-primary" 
                          : "hover:bg-base-200 hover:scale-[1.01]"
                        }
                      `}
                      onClick={() => handleFontChange(fontOption.name, fontOption.fontFamily)}
                    >
                      {/* Font Preview Box */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${categoryColors[fontOption.category] || "from-gray-500 to-gray-600"} shadow-md flex-shrink-0`}>
                        <span className="text-white text-sm font-bold">
                          {categoryIcons[fontOption.category] || "Aa"}
                        </span>
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <p 
                          className={`text-base font-semibold truncate ${isActive ? "text-primary" : "text-base-content"}`}
                          style={{ fontFamily: fontOption.fontFamily }}
                        >
                          {fontOption.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-base-content/50 bg-base-300/50 px-1.5 py-0.5 rounded-full">
                            {fontOption.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-base-content/40 mt-1 hidden sm:block line-clamp-1">
                          {fontOption.description}
                        </p>
                      </div>
                      
                      {/* Preview Text */}
                      <div className="hidden md:block text-right flex-shrink-0">
                        <p 
                          className="text-sm text-base-content/50"
                          style={{ fontFamily: fontOption.fontFamily }}
                        >
                          The quick brown fox
                        </p>
                      </div>
                      
                      {isActive && (
                        <CheckCircle className="w-5 h-5 text-primary ml-1 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Stats */}
            <div className="p-3 border-t border-base-300 bg-base-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-base-content/60">
                    {filteredFonts.length} of {FONTS.length} fonts available
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-base-content/40">Live Preview</span>
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
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default FontSelector;