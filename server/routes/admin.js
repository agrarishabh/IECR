import express from 'express';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
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

// GET /api/admin/stats
router.get('/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [movieCount, webseriesCount] = await Promise.all([
      Movie.countDocuments(),
      Webseries.countDocuments(),
    ]);
    res.status(200).json({ movies: movieCount, webseries: webseriesCount });
  } catch (err) {
    next(err);
  }
});

export default router;
