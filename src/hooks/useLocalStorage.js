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

  // NEW: the "storage" event. When ANOTHER tab of this site changes localStorage, the browser tells every
  // other open tab with a "storage" event (the tab that made the change doesn't get one). Without this,
  // each tab kept its own copy from when it opened: if tab A booked a table and then tab B (already open)
  // booked another, tab B saved its old list plus its new booking, and tab A's booking was lost.
  // Now, when another tab saves this key, this tab reads the new value too, so the next save includes it.
  useEffect(() => {
    function handleStorage(event) {
      // Only our key. (event.key is null when another tab cleared all storage.)
      if (event.key !== key && event.key !== null) {
        return;
      }
      try {
        // newValue is the new text, or null if it was removed: then start from the initial value.
        setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue));
      } catch (error) {
        // The other tab saved text that isn't valid JSON: keep this tab's value rather than crash.
      }
    }
    window.addEventListener('storage', handleStorage);
    // The cleanup removes the listener when the component goes away (or the key changes),
    // so an old listener never updates a component that's gone.
    return () => window.removeEventListener('storage', handleStorage);
    // initialValue is usually a new [] on every render; listing it would re-add the listener every time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}

export default useLocalStorage;
