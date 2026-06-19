import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getWatchlistIds, getRatingsMap } from '../lib/api';
const WatchlistContext = createContext(null);

export const WatchlistProvider = ({ children }) => {
  const { user, isLoaded } = useUser();

  // Watchlist — Set of content _id strings
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  // Ratings — Map of contentId -> rating number
  const [ratingsMap, setRatingsMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!isLoaded || !user) {
      setWatchlistIds(new Set());
      setRatingsMap({});
      return;
    }
    setLoading(true);
    try {
      // Both calls use the api.js interceptor which auto-attaches the token
      const [ids, ratMap] = await Promise.all([
        getWatchlistIds(),
        getRatingsMap(),
      ]);
      setWatchlistIds(new Set(ids.map(String)));
      setRatingsMap(ratMap || {});
    } catch (err) {
      console.error('WatchlistContext fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Watchlist helpers ──────────────────────────────────────────────────────
  const isInWatchlist = (id) => watchlistIds.has(String(id));

  const addToWatchlist = (id) =>
    setWatchlistIds(prev => new Set([...prev, String(id)]));

  const removeFromWatchlist = (id) =>
    setWatchlistIds(prev => { const s = new Set(prev); s.delete(String(id)); return s; });

  // ── Ratings helpers ────────────────────────────────────────────────────────
  const getRating = (id) => ratingsMap[String(id)] || null;

  const setRating = (id, rating) =>
    setRatingsMap(prev => ({ ...prev, [String(id)]: rating }));

  const removeRating = (id) =>
    setRatingsMap(prev => { const m = { ...prev }; delete m[String(id)]; return m; });

  return (
    <WatchlistContext.Provider value={{
      loading,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      getRating,
      setRating,
      removeRating,
      refetch: fetchAll,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
};
