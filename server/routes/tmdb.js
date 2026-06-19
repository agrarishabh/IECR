import express from 'express';
import { searchMovie, searchTv, getMovieDetails, getTvDetails } from '../services/tmdb.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/tmdb/details
 *
 * Searches TMDB by title + year, then fetches full details.
 * Query params:
 *   title  — movie or series title (required)
 *   year   — release year (required)
 *   type   — "movie" | "tv" (required)
 */
router.get('/details', async (req, res, next) => {
  const { title, year, type } = req.query;

  if (!title || !year || !type) {
    return next(createError(400, 'title, year, and type are required query parameters'));
  }
  if (type !== 'movie' && type !== 'tv') {
    return next(createError(400, 'type must be "movie" or "tv"'));
  }

  try {
    // Step 1: search for the item on TMDB
    const searchResult = type === 'movie'
      ? await searchMovie(title, year)
      : await searchTv(title, year);

    if (!searchResult) {
      return res.status(404).json({ found: false, message: 'Not found on TMDB' });
    }

    // Step 2: fetch full details using the found TMDB id
    const details = type === 'movie'
      ? await getMovieDetails(searchResult.id)
      : await getTvDetails(searchResult.id);

    res.status(200).json({ found: true, ...details });
  } catch (err) {
    // If TMDB fails (rate limit, network), return graceful not-found
    if (err.response?.status === 404) {
      return res.status(404).json({ found: false, message: 'Not found on TMDB' });
    }
    next(err);
  }
});

export default router;
