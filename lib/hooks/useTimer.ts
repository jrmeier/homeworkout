'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialSeconds?: number;
  countDown?: boolean;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTimer({
  initialSeconds = 0,
  countDown = false,
  onComplete,
  autoStart = false,
}: UseTimerOptions = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (countDown) {
            if (prev <= 1) {
              setIsRunning(false);
              onCompleteRef.current?.();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, countDown]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setSeconds(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const formatTime = useCallback((totalSeconds: number = seconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    toggle,
    formatTime,
    setSeconds,
  };
}
