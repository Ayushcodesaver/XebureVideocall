import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("xebure-theme") || "forest",
  setTheme: (theme) => {
    // Save to localStorage
    localStorage.setItem("xebure-theme", theme);
    // Apply to DOM immediately
    document.documentElement.setAttribute('data-theme', theme);
    // Update store state
    set({ theme });
  },
}));

// Initialize theme on page load
const initialTheme = localStorage.getItem("xebure-theme") || "forest";
document.documentElement.setAttribute('data-theme', initialTheme);