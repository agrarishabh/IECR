/**
 * Centralized API service layer.
 * All server calls go through here — no scattered axios calls in components.
 *
 * The axios instance automatically attaches the Clerk auth token when
 * a `getToken` function is provided via setTokenGetter().
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Token getter — set once on app init from Clerk's useAuth hook
let _getToken = null;
export const setTokenGetter = (fn) => { _getToken = fn; };

// Axios instance
const api = axios.create({ baseURL: BASE_URL });

// Request interceptor — attach Bearer token when available
api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // No token — request proceeds without auth (public endpoints)
    }
  }
  return config;
});

// ── Movies ────────────────────────────────────────────────────────────────────
export const getMovies = () =>
  api.get('/api/movies').then(r => r.data);

// ── Webseries ─────────────────────────────────────────────────────────────────
export const getWebseries = () =>
  api.get('/api/webseries').then(r => r.data);

// ── Watchlist ─────────────────────────────────────────────────────────────────
export const getWatchlist = () =>
  api.get('/api/watchlist/me').then(r => r.data);

export const getWatchlistIds = () =>
  api.get('/api/watchlist/ids').then(r => r.data);

export const addToWatchlistAPI = (payload) =>
  api.post('/api/watchlist/add', payload).then(r => r.data);

export const removeFromWatchlistAPI = (payload) =>
  api.delete('/api/watchlist/remove', { data: payload }).then(r => r.data);

// ── Ratings ───────────────────────────────────────────────────────────────────
export const getRatingsMap = () =>
  api.get('/api/ratings/map').then(r => r.data);

export const getMyRatings = () =>
  api.get('/api/ratings/me').then(r => r.data);

export const submitRating = (payload) =>
  api.post('/api/ratings', payload).then(r => r.data);

export const deleteRating = (contentId, contentType) =>
  api.delete(`/api/ratings/${contentId}`, { data: { contentType } }).then(r => r.data);

// ── TMDB details ─────────────────────────────────────────────────────────────
export const getTmdbDetails = ({ title, year, type }) =>
  api.get('/api/tmdb/details', { params: { title, year, type } }).then(r => r.data);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAdminStats = () =>
  api.get('/api/admin/stats').then(r => r.data);

export default api;
