import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Hide with a slight delay so user sees the "back online" state
      setTimeout(() => setIsVisible(false), 2000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    if (!navigator.onLine) {
      setIsOffline(true);
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isOffline 
          ? 'translate-y-0' 
          : 'translate-y-0'
      }`}
    >
      <div
        className={`flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-colors duration-300 ${
          isOffline
            ? 'bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white'
            : 'bg-gradient-to-r from-emerald-600/90 to-green-600/90 text-white'
        }`}
      >
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline — data will sync when connected</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Back online — syncing...</span>
          </>
        )}
      </div>
    </div>
  );
};
