import express from 'express';
import Rating from '../models/Rating.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
import { authenticate } from '../middleware/clerkAuth.js';
import { createError } from '../middleware/errorHandler.js';
import { notifyFriends } from '../utils/notify.js';

const router = express.Router();
router.use(authenticate);

// POST /api/ratings — upsert a rating (create or update)
router.post('/', async (req, res, next) => {
  const userId = req.userId;
  const { contentId, contentType, rating } = req.body;

  if (!contentId || !contentType) {
    return next(createError(400, 'contentId and contentType are required'));
  }
  if (!['movie', 'tv'].includes(contentType)) {
    return next(createError(400, 'contentType must be "movie" or "tv"'));
  }
  if (!rating || rating < 1 || rating > 10) {
    return next(createError(400, 'Rating must be between 1 and 10'));
  }

  try {
    const doc = await Rating.findOneAndUpdate(
      { userId, contentId: String(contentId), contentType },
      { rating },
      { upsert: true, new: true }
    );
    
    // Notify friends
    const isNew = !doc.createdAt || (doc.createdAt.getTime() === doc.updatedAt?.getTime());
    const actionText = isNew ? 'rated' : 'updated their rating for';
    
    let contentName = contentType === 'movie' ? 'a movie' : 'a webseries';
    try {
      const Model = contentType === 'movie' ? Movie : Webseries;
      const existing = await Model.findById(contentId);
      if (existing) {
        if (contentType === 'movie') {
          contentName = `${existing.title} (${existing.release_year})`;
        } else {
          contentName = `${existing.name} (${existing.first_air_date ? existing.first_air_date.substring(0,4) : 'N/A'})`;
        }
      }
    } catch (e) {}
    
    await notifyFriends(userId, 'rating', `{name} ${actionText} ${contentName}.`, { contentId, contentType, rating });

    res.status(200).json({ message: 'Rating saved', doc });
  } catch (err) {
    next(err);
  }
});

// GET /api/ratings/me — all ratings with full content details
router.get('/me', async (req, res, next) => {
  const userId = req.userId;
  try {
    const ratings = await Rating.find({ userId });

    const movieRatings = ratings.filter(r => r.contentType === 'movie');
    const tvRatings = ratings.filter(r => r.contentType === 'tv');

    const [movies, webseries] = await Promise.all([
      Movie.find({ _id: { $in: movieRatings.map(r => r.contentId) } }),
      Webseries.find({ _id: { $in: tvRatings.map(r => r.contentId) } }),
    ]);

    const ratingMap = Object.fromEntries(ratings.map(r => [r.contentId, r.rating]));

    const ratedMovies = movies.map(m => ({
      ...(m.toObject ? m.toObject() : m),
      userRating: ratingMap[m._id] || null,
    }));

    const ratedWebseries = webseries.map(w => ({
      ...(w.toObject ? w.toObject() : w),
      userRating: ratingMap[w._id] || null,
    }));

    res.status(200).json({ movies: ratedMovies, webseries: ratedWebseries });
  } catch (err) {
    next(err);
  }
});

// GET /api/ratings/map — lightweight map of contentId -> rating (used by context)
router.get('/map', async (req, res, next) => {
  const userId = req.userId;
  try {
    const ratings = await Rating.find({ userId }, 'contentId rating contentType');
    const map = {};
    ratings.forEach(r => { map[r.contentId] = r.rating; });
    res.status(200).json(map);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ratings/:contentId — remove a rating
router.delete('/:contentId', async (req, res, next) => {
  const userId = req.userId;
  const { contentType } = req.body;
  try {
    await Rating.findOneAndDelete({
      userId,
      contentId: req.params.contentId,
      contentType,
    });
    res.status(200).json({ message: 'Rating removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
