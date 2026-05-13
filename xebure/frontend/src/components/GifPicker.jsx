import { useState, useEffect } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Get GIPHY API key from environment variables
// Sign up at https://developers.giphy.com/ to get your free API key
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || '';

const GifPicker = ({ onSelect, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);

  // Fetch trending GIFs on mount
  useEffect(() => {
    fetchTrending();
  }, []);

  // Search GIFs when search term changes (debounced)
  useEffect(() => {
    if (!searchTerm) {
      fetchTrending();
      return;
    }

    const delayDebounce = setTimeout(() => {
      searchGifs();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchTrending = async () => {
    if (!GIPHY_API_KEY) {
      // Show demo GIFs if no API key
      setTrending([
        { id: 'demo1', images: { fixed_height: { url: 'https://media.tenor.com/-VzBwXgwE1QAAAAC/cat-stare.gif' } } },
        { id: 'demo2', images: { fixed_height: { url: 'https://media.tenor.com/CQpzt8UdL9IAAAAC/dancing-dance.gif' } } },
        { id: 'demo3', images: { fixed_height: { url: 'https://media.tenor.com/5o7Lvj5qLpEAAAAC/happy-dog.gif' } } },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=pg`
      );
      const data = await response.json();
      if (data.data) {
        setTrending(data.data);
      }
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      toast.error('Failed to load trending GIFs');
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async () => {
    if (!searchTerm.trim()) return;

    if (!GIPHY_API_KEY) {
      // Show demo search results
      setGifs([
        { id: 'search1', images: { fixed_height: { url: 'https://media.tenor.com/-VzBwXgwE1QAAAAC/cat-stare.gif' } } },
        { id: 'search2', images: { fixed_height: { url: 'https://media.tenor.com/CQpzt8UdL9IAAAAC/dancing-dance.gif' } } },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=20&rating=pg`
      );
      const data = await response.json();
      if (data.data) {
        setGifs(data.data);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
      toast.error('Failed to search GIFs');
    } finally {
      setLoading(false);
    }
  };

  const displayGifs = searchTerm ? gifs : trending;
  const hasNoResults = !loading && displayGifs.length === 0;

  return (
    <div className="bg-base-200 rounded-xl p-3 mb-2 animate-slideUp">
      {/* Header with Search */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-base-100 border border-base-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            autoFocus
          />
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Trending Label */}
      {!searchTerm && !loading && displayGifs.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs text-base-content/60 font-medium">Trending on GIPHY</span>
        </div>
      )}

      {/* Search Results Label */}
      {searchTerm && !loading && displayGifs.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-xs text-base-content/60 font-medium">
            Results for "{searchTerm}"
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* No Results */}
      {hasNoResults && (
        <div className="text-center py-8">
          <p className="text-sm text-base-content/50">No GIFs found</p>
          <p className="text-xs text-base-content/30 mt-1">Try a different search term</p>
        </div>
      )}

      {/* GIF Grid */}
      {!loading && displayGifs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto p-1">
          {displayGifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.images.fixed_height.url)}
              className="aspect-video rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              title="Select GIF"
            >
              <img
                src={gif.images.fixed_height.url}
                alt="GIF"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* API Key Info (only shown when no API key) */}
      {!GIPHY_API_KEY && (
        <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <p className="text-xs text-yellow-600 text-center">
            💡 Add <code className="bg-yellow-500/20 px-1 rounded">VITE_GIPHY_API_KEY</code> to your .env file to enable real GIF search.
            Get a free API key from{' '}
            <a 
              href="https://developers.giphy.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-yellow-700"
            >
              GIPHY Developers
            </a>
          </p>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default GifPicker;