'use client';

import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);

      lock.addEventListener('release', () => {
        setWakeLock(null);
      });

      return true;
    } catch (err) {
      console.error('Failed to acquire wake lock:', err);
      return false;
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  // Re-acquire wake lock when document becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLock, request]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return {
    isSupported,
    isActive: wakeLock !== null,
    request,
    release,
  };
}
