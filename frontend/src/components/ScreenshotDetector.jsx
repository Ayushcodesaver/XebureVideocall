import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const ScreenshotDetector = ({ onScreenshot, children }) => {
  const detectionRef = useRef(null);

  useEffect(() => {
    // Detect print screen
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        toast.error("📸 Screenshot detected!");
        onScreenshot?.();
        return false;
      }
      
      // Detect Ctrl + S (save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        toast.error("⚠️ Saving is disabled in this chat");
        return false;
      }
    };

    // Detect right click on images
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        toast.error("❌ Images are protected");
        return false;
      }
    };

    // Detect screen capture via keyboard shortcut detection
    let startTime = 0;
    const handleKeyPress = (e) => {
      if (e.key === 'PrintScreen') {
        toast.error("📸 Screenshot blocked!");
        onScreenshot?.();
      }
    };

    // Monitor visibility change (screen recording detection)
    let recordingInterval;
    let lastSize = window.innerWidth;

    const checkRecording = () => {
      if (window.innerWidth !== lastSize) {
        lastSize = window.innerWidth;
        return;
      }
      
      // Heuristic: rapid resize detection
      const now = Date.now();
      if (now - startTime < 100) {
        toast.warning("⛔ Screen recording detected!");
        onScreenshot?.();
      }
      startTime = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyPress);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', checkRecording);
    recordingInterval = setInterval(checkRecording, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyPress);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', checkRecording);
      clearInterval(recordingInterval);
    };
  }, [onScreenshot]);

  return <div ref={detectionRef} className="screenshot-protected">{children}</div>;
};

export default ScreenshotDetector;