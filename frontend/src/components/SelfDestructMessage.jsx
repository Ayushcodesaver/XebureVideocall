import { useState, useEffect } from "react";

const SelfDestructMessage = ({ message, duration = 30000, onDestroy }) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsVisible(false);
          onDestroy?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const destructTimer = setTimeout(() => {
      setIsVisible(false);
      onDestroy?.();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(destructTimer);
    };
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className="relative group">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-yellow-500">🔥 Self-destructing</span>
          <span className="text-xs text-yellow-500/70">{timeLeft}s</span>
        </div>
        <p className="text-sm text-white">{message}</p>
      </div>
      <div className="absolute inset-0 rounded-lg border border-yellow-500/30 animate-pulse pointer-events-none"></div>
    </div>
  );
};

export default SelfDestructMessage;