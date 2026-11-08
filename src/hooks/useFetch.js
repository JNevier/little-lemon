import { useState, useEffect } from 'react';

// A custom hook: a function whose name starts with "use" and that calls other hooks.
// It lets any component load JSON from a URL with one line:
//   const { data, loading, error, retry } = useFetch('/data/menu.json');
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Counts the "Try again" clicks. The number itself doesn't matter: changing it makes the effect
  // below run again, which loads the same url a second time.
  const [attempt, setAttempt] = useState(0);

  // useEffect runs after the component appears on screen, and again whenever `url` changes.
  // Loading data is a "side effect": it talks to the world outside React, so it goes here, not in the render.
  useEffect(() => {
    // NEW: AbortController lets us cancel a fetch that is still running.
    // We pass its `signal` to fetch(); calling controller.abort() stops the request.
    const controller = new AbortController();

    // Start every new load from a clean "loading" state.
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        // fetch() only fails on network problems. A "404 Not Found" still counts as a reply,
        // so we check response.ok (true for status 200-299) ourselves.
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        // We cancelled this request on purpose (see the cleanup below), so it is not an error.
        // The component is gone or a newer request has replaced this one, so don't touch the state.
        if (err.name === 'AbortError') {
          return;
        }
        setError(err);
        setLoading(false);
      }
    }

    load();

    // The cleanup function: React runs it when the component leaves the screen, or before the
    // effect runs again for a new url. Aborting here stops an old reply from overwriting newer data.
    // In development, React Strict Mode runs every effect twice on purpose (run, clean up, run again)
    // to catch missing cleanups. So you'll see one cancelled request in the Network tab. That's expected.
    return () => controller.abort();
    // `attempt` is listed too, so retry() (which changes it) starts a new load.
  }, [url, attempt]);

  // Call this after an error (for example from a "Try again" button) to load the data again.
  function retry() {
    setAttempt((count) => count + 1);
  }

  return { data, loading, error, retry };
}

export default useFetch;
