import axios from 'axios';
import http from 'http';
import https from 'https';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const API_KEY = process.env.TMDB_API_KEY;

// keepAlive: false prevents ECONNRESET from connection reuse
const tmdb = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: API_KEY },
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false }),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Retry wrapper for transient TMDB errors
const tmdbGet = async (path, params = {}, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await tmdb.get(path, { params });
      return data;
    } catch (err) {
      const isRetryable =
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.response?.status === 429;
      if (isRetryable && attempt < retries) {
        await sleep(attempt * 800);
      } else {
        throw err;
      }
    }
  }
};

// ── Image helpers ─────────────────────────────────────────────────────────────
export const backdropUrl = (path) => (path ? `${TMDB_IMAGE_BASE}/w1280${path}` : '');
export const posterUrl = (path) => (path ? `${TMDB_IMAGE_BASE}/w500${path}` : '');
export const profileUrl = (path) => (path ? `${TMDB_IMAGE_BASE}/w185${path}` : '');

// ── Search movie by title + year ──────────────────────────────────────────────
// Returns best matching TMDB movie result or null
export const searchMovie = async (title, year) => {
  const data = await tmdbGet('/search/movie', {
    query: title,
    year,
    language: 'en-US',
    include_adult: false,
  });
  if (!data.results?.length) return null;
  // Prefer exact year match if multiple results
  const exact = data.results.find(
    (r) => r.release_date?.startsWith(String(year))
  );
  return exact || data.results[0];
};

// ── Search TV series by title + year ─────────────────────────────────────────
export const searchTv = async (title, year) => {
  const data = await tmdbGet('/search/tv', {
    query: title,
    first_air_date_year: year,
    language: 'en-US',
    include_adult: false,
  });
  if (!data.results?.length) return null;
  const exact = data.results.find(
    (r) => r.first_air_date?.startsWith(String(year))
  );
  return exact || data.results[0];
};

// ── Get full movie details: cast, crew, trailer, overview ─────────────────────
export const getMovieDetails = async (tmdbId) => {
  const data = await tmdbGet(`/movie/${tmdbId}`, {
    append_to_response: 'credits,videos',
    language: 'en-US',
  });

  const trailer = data.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  const cast = (data.credits?.cast || []).slice(0, 10).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile_path: profileUrl(c.profile_path),
  }));

  const director = (data.credits?.crew || []).find((c) => c.job === 'Director');

  return {
    tmdbId: data.id,
    title: data.title,
    overview: data.overview || '',
    tagline: data.tagline || '',
    backdrop_path: backdropUrl(data.backdrop_path),
    poster_path: posterUrl(data.poster_path),
    release_date: data.release_date || '',
    runtime: data.runtime || 0,
    genres: (data.genres || []).map((g) => g.name),
    rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 0,
    votes: data.vote_count || 0,
    trailer_key: trailer?.key || '',
    cast,
    director: director ? director.name : '',
    status: data.status || '',
    original_language: data.original_language || '',
  };
};

// ── Get full TV series details: cast, crew, trailer, overview ─────────────────
export const getTvDetails = async (tmdbId) => {
  const data = await tmdbGet(`/tv/${tmdbId}`, {
    append_to_response: 'credits,videos',
    language: 'en-US',
  });

  const trailer = data.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  const cast = (data.credits?.cast || []).slice(0, 10).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile_path: profileUrl(c.profile_path),
  }));

  const creator = data.created_by?.[0];

  return {
    tmdbId: data.id,
    title: data.name,
    overview: data.overview || '',
    tagline: data.tagline || '',
    backdrop_path: backdropUrl(data.backdrop_path),
    poster_path: posterUrl(data.poster_path),
    first_air_date: data.first_air_date || '',
    seasons: data.number_of_seasons || 1,
    episodes: data.number_of_episodes || 0,
    genres: (data.genres || []).map((g) => g.name),
    rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 0,
    votes: data.vote_count || 0,
    trailer_key: trailer?.key || '',
    cast,
    creator: creator ? creator.name : '',
    status: data.status || '',
    original_language: data.original_language || '',
  };
};
