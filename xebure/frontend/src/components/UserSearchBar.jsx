import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";  // ✅ Removed unused UserPlus, Check
import { searchUsers } from "../lib/api";
import UserProfileModal from "./UserProfileModal";

const UserSearchBar = ({ onUserSelect }) => {  // ✅ Removed currentUserId
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await searchUsers(query);
        if (response.success) {
          setResults(response.users);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setShowResults(false);
    setQuery("");
    if (onUserSelect) onUserSelect(user);
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by username / @username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && results.length > 0 && setShowResults(true)}
            className="w-full pl-10 pr-10 py-2.5 bg-base-200 border border-base-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-base-content/40 hover:text-base-content" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 mt-2 w-full bg-base-100 border border-base-300 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserClick(user)}
                className="w-full flex items-center gap-3 p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
              >
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?background=00A19B&color=fff&name=${user.fullName}`}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-base-content">{user.fullName}</p>
                  <p className="text-xs text-base-content/50">@{user.username}</p>
                </div>
                <div className="flex gap-1 text-xs">
                  {user.nativeLanguage && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px]">
                      {user.nativeLanguage}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && query.length >= 2 && (
          <div className="absolute z-50 mt-2 w-full bg-base-100 border border-base-300 rounded-xl shadow-2xl p-4 text-center">
            <p className="text-sm text-base-content/50">No users found for "{query}"</p>
          </div>
        )}
      </div>

      {/* User Profile Modal - currentUserId removed */}
      {showModal && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
};

export default UserSearchBar;