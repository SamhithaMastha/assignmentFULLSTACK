import { useState, useEffect } from 'react';

/**
 * useLocalStorage(key, defaultValue) -> [value, setValue]
 *
 * Generic hook that behaves like useState but persists to localStorage.
 * - Reads from localStorage exactly once, via a lazy initializer, so we
 *   never touch localStorage on every render.
 * - Writes to localStorage every time the value changes (useEffect).
 * - Safe to use with primitives, arrays, or plain objects (anything
 *   JSON-serializable).
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch (err) {
      // Corrupt JSON or localStorage unavailable (e.g. private mode) —
      // fall back to the default rather than crashing the app.
      console.warn(`useLocalStorage: couldn't read "${key}"`, err);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalStorage: couldn't write "${key}"`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
