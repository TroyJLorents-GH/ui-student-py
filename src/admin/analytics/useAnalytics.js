import { useEffect, useState } from 'react';

const baseUrl = process.env.REACT_APP_API_URL;

// Fetches a JSON analytics endpoint. `path` may include query string.
export function useAnalytics(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    if (!path) { setData(null); setLoading(false); setError(''); return undefined; }
    (async () => {
      setLoading(true); setError('');
      try {
        const r = await fetch(`${baseUrl}${path}`, { credentials: 'include' });
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        const json = await r.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) { setError(String(e.message || e)); setData(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
}
