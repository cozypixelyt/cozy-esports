import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowReconnected(false);
    } else {
      // Only show brief notice if recovering inside session
      if (performance.now() > 4000) {
        setShowReconnected(true);
        const t = setTimeout(() => setShowReconnected(false), 3000);
        return () => clearTimeout(t);
      }
    }
  }, [isOnline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
      <div
        className={`pointer-events-auto px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xl ${
          isOnline
            ? 'bg-blue-950/95 border-blue-500/60 text-blue-200'
            : 'bg-red-950/95 border-red-500/60 text-red-200'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Back Online · Live Sync Active</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
            <span>Offline · Cached Mode</span>
          </>
        )}
      </div>
    </div>
  );
};
