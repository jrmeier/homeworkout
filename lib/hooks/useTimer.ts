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
  const endTimeRef = useRef<number | null>(null);
  const secondsRef = useRef(seconds);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (isRunning) {
      if (countDown && endTimeRef.current === null) {
        endTimeRef.current = Date.now() + secondsRef.current * 1000;
      }

      intervalRef.current = setInterval(() => {
        if (countDown) {
          const endTime = endTimeRef.current;
          if (endTime === null) return;

          const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
          setSeconds(remaining);

          if (remaining === 0) {
            setIsRunning(false);
            endTimeRef.current = null;
            onCompleteRef.current?.();
          }
          return;
        }

        setSeconds((prev) => prev + 1);
      }, countDown ? 250 : 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, countDown]);

  const start = useCallback(() => {
    if (countDown) {
      endTimeRef.current = Date.now() + seconds * 1000;
    }
    setIsRunning(true);
  }, [countDown, seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setSeconds(newSeconds ?? initialSeconds);
    endTimeRef.current = null;
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
