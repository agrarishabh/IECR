import express from 'express';
import Movie from '../models/Movie.js';
import Comment from '../models/Comment.js';
import { createError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/clerkAuth.js';

const router = express.Router();

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean);

const requireAdmin = (req, res, next) => {
  if (!ADMIN_USER_IDS.includes(req.userId)) {
    return next(createError(403, 'Forbidden: Admin access required'));
  }
  next();
};

import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { logger } from '../lib/logger.js';

const movieSchema = z.object({
  _id: z.string().optional(),
  id: z.number().or(z.string()),
  title: z.string(),
  backdrop_path: z.string(),
  release_year: z.number().or(z.string()),
  runtime: z.number().or(z.string()),
  rating: z.number().or(z.string()),
  votes: z.number().or(z.string()),
});

const movieUpdateSchema = z.object({
  backdrop_path: z.string().optional(),
  rating: z.number().or(z.string()).optional(),
  votes: z.number().or(z.string()).optional(),
});

// GET /api/movies — public
router.get('/', async (req, res, next) => {
  try {
    const movies = await Movie.find().lean();
    const movieIds = movies.map(m => String(m._id || m.id));
    
    const commentCounts = await Comment.aggregate([
      { $match: { contentId: { $in: movieIds }, contentType: 'movie' } },
      { $group: { _id: '$contentId', count: { $sum: 1 } } }
    ]);

    const countMap = Object.fromEntries(commentCounts.map(c => [c._id, c.count]));
    const data = movies.map(m => ({
      ...m,
      commentCount: countMap[String(m._id || m.id)] || 0
    }));

    res.status(200).json(data);
  } catch (err) { next(err); }
});

// POST /api/movies — admin only
router.post('/', authenticate, requireAdmin, validate(movieSchema), async (req, res, next) => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    logger.info(`[MOVIES] Created movie: ${newMovie.title}`);
    res.status(201).json(newMovie);
  } catch (err) { next(err); }
});

// PUT /api/movies/:id — admin only
router.put('/:id', authenticate, requireAdmin, validate(movieUpdateSchema), async (req, res, next) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return next(createError(404, 'Movie not found'));
    logger.info(`[MOVIES] Updated movie: ${updated.title}`);
    res.status(200).json({ message: 'Movie updated successfully', movie: updated });
  } catch (err) { next(err); }
});

// DELETE /api/movies/:id — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return next(createError(404, 'Movie not found'));
    logger.info(`[MOVIES] Deleted movie: ${req.params.id}`);
    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
