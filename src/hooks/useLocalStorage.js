import { useState, useEffect } from 'react';

// Works like useState, but the value is also saved in the browser, so it survives a page reload.
//   const [reservations, setReservations] = useLocalStorage('little-lemon-reservations', []);
//
// NEW: localStorage is a small key/value store built into the browser. It only stores text,
// so we turn values into text with JSON.stringify and back with JSON.parse.
// It can fail: a private window or strict settings may block it (it throws an error),
// and the saved text may be broken (JSON.parse throws). So every use is wrapped in try/catch.
function useLocalStorage(key, initialValue) {
  // Lazy initial state: passing a FUNCTION to useState means React runs it only on the first render,
  // not on every render. Reading storage is slow-ish, so we only do it once.
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      // getItem gives null when nothing is saved under this key yet.
      return saved === null ? initialValue : JSON.parse(saved);
    } catch (error) {
      // Storage is blocked, or the saved text isn't valid JSON: start fresh instead of crashing.
      return initialValue;
    }
  });

  // After every change to the value, save it. The effect runs after React has updated the screen.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage is blocked or full. The app keeps working for this visit; it just won't remember.
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
