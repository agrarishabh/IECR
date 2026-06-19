import express from 'express';
import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
import { createError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/clerkAuth.js';
import { notifyFriends } from '../utils/notify.js';

const router = express.Router();
router.use(authenticate);

// POST /api/watchlist/add
router.post('/add', async (req, res, next) => {
  const userId = req.userId;
  const { movie, webseries } = req.body;

  try {
    if (movie) {
      const movieId = movie._id || String(movie.id);
      const existing = await Movie.findById(movieId);
      if (!existing) return next(createError(404, 'Movie not found in database.'));
      const alreadyAdded = await Watchlist.findOne({ userId, movieId });
      if (alreadyAdded) return res.status(409).json({ message: 'Movie already in watchlist.' });
      await new Watchlist({ userId, movieId }).save();
      
      const contentName = `${existing.title} (${existing.release_year})`;
      await notifyFriends(userId, 'watchlist_add', `{name} added ${contentName} to their watchlist.`, { contentId: movieId, contentType: 'movie' });

      return res.status(200).json({ message: 'Movie added to watchlist.' });
    }

    if (webseries) {
      const webseriesId = webseries._id || String(webseries.id);
      const existing = await Webseries.findById(webseriesId);
      if (!existing) return next(createError(404, 'Webseries not found in database.'));
      const alreadyAdded = await Watchlist.findOne({ userId, webseriesId });
      if (alreadyAdded) return res.status(409).json({ message: 'Webseries already in watchlist.' });
      await new Watchlist({ userId, webseriesId }).save();
      
      const contentName = `${existing.name} (${existing.first_air_date ? existing.first_air_date.substring(0,4) : 'N/A'})`;
      await notifyFriends(userId, 'watchlist_add', `{name} added ${contentName} to their watchlist.`, { contentId: webseriesId, contentType: 'tv' });

      return res.status(200).json({ message: 'Webseries added to watchlist.' });
    }

    next(createError(400, 'Provide either movie or webseries data.'));
  } catch (err) {
    next(err);
  }
});

// GET /api/watchlist/me — full watchlist with content details
router.get('/me', async (req, res, next) => {
  const userId = req.userId;
  try {
    const list = await Watchlist.find({ userId })
      .populate('movieId')
      .populate('webseriesId');

    const movies = list
      .filter(e => e.movieId)
      .map(e => e.movieId.toObject ? e.movieId.toObject() : e.movieId);

    const webseries = list
      .filter(e => e.webseriesId)
      .map(e => e.webseriesId.toObject ? e.webseriesId.toObject() : e.webseriesId);

    res.status(200).json({ movies, webseries });
  } catch (err) {
    next(err);
  }
});

// GET /api/watchlist/ids — lightweight set of watchlisted IDs (used by context)
router.get('/ids', async (req, res, next) => {
  const userId = req.userId;
  try {
    const list = await Watchlist.find({ userId }, 'movieId webseriesId');
    const ids = list.map(e => e.movieId || e.webseriesId).filter(Boolean);
    res.status(200).json(ids);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/watchlist/remove
router.delete('/remove', async (req, res, next) => {
  const userId = req.userId;
  const { movieId, webseriesId } = req.body;
  try {
    if (movieId) {
      await Watchlist.findOneAndDelete({ userId, movieId: String(movieId) });
      return res.status(200).json({ message: 'Movie removed from watchlist.' });
    }
    if (webseriesId) {
      await Watchlist.findOneAndDelete({ userId, webseriesId: String(webseriesId) });
      return res.status(200).json({ message: 'Webseries removed from watchlist.' });
    }
    next(createError(400, 'Missing movieId or webseriesId.'));
  } catch (err) {
    next(err);
  }
});

export default router;
