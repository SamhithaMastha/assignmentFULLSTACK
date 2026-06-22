import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useTimer(initialSeconds) -> {
 *   secondsRemaining, isRunning, start, pause, reset, setDuration
 * }
 *
 * Encapsulates the countdown so FocusTimer.jsx stays pure UI.
 * - One setInterval, ticking once per second, cleared on pause/unmount.
 * - Guarded against double-starting the interval on repeated clicks.
 */
export function useTimer(initialSeconds = 25 * 60) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Clear any existing interval — the single chokepoint every start/stop
  // path runs through, so we can never end up with two intervals ticking.
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return; // already running, ignore
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback((seconds = initialSeconds) => {
    clearTimer();
    setIsRunning(false);
    setSecondsRemaining(seconds);
  }, [clearTimer, initialSeconds]);

  const setDuration = useCallback((seconds) => {
    clearTimer();
    setIsRunning(false);
    setSecondsRemaining(seconds);
  }, [clearTimer]);

  // Cleanup on unmount so we never leak an interval.
  useEffect(() => clearTimer, [clearTimer]);

  return { secondsRemaining, isRunning, start, pause, reset, setDuration };
}

export function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
