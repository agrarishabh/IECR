import express from 'express';
import Webseries from '../models/Webseries.js';
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

const webseriesSchema = z.object({
  _id: z.string().optional(),
  id: z.number().or(z.string()),
  title: z.string(),
  backdrop_path: z.string(),
  release_year: z.number().or(z.string()),
  seasons: z.number().or(z.string()),
  rating: z.number().or(z.string()),
  votes: z.number().or(z.string()),
});

const webseriesUpdateSchema = z.object({
  backdrop_path: z.string().optional(),
  seasons: z.number().or(z.string()).optional(),
  rating: z.number().or(z.string()).optional(),
  votes: z.number().or(z.string()).optional(),
});

// GET /api/webseries — public
router.get('/', async (req, res, next) => {
  try {
    const webseries = await Webseries.find().lean();
    const seriesIds = webseries.map(w => String(w._id || w.id));
    
    const commentCounts = await Comment.aggregate([
      { $match: { contentId: { $in: seriesIds }, contentType: 'tv' } },
      { $group: { _id: '$contentId', count: { $sum: 1 } } }
    ]);

    const countMap = Object.fromEntries(commentCounts.map(c => [c._id, c.count]));
    const data = webseries.map(w => ({
      ...w,
      commentCount: countMap[String(w._id || w.id)] || 0
    }));

    res.status(200).json(data);
  } catch (err) { next(err); }
});

// POST /api/webseries — admin only
router.post('/', authenticate, requireAdmin, validate(webseriesSchema), async (req, res, next) => {
  try {
    const newWebseries = new Webseries(req.body);
    await newWebseries.save();
    logger.info(`[WEBSERIES] Created webseries: ${newWebseries.title}`);
    res.status(201).json(newWebseries);
  } catch (err) { next(err); }
});

// PUT /api/webseries/:id — admin only
router.put('/:id', authenticate, requireAdmin, validate(webseriesUpdateSchema), async (req, res, next) => {
  try {
    const updated = await Webseries.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return next(createError(404, 'Webseries not found'));
    logger.info(`[WEBSERIES] Updated webseries: ${updated.title}`);
    res.status(200).json({ message: 'Webseries updated successfully', webseries: updated });
  } catch (err) { next(err); }
});

// DELETE /api/webseries/:id — admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Webseries.findByIdAndDelete(req.params.id);
    if (!deleted) return next(createError(404, 'Webseries not found'));
    logger.info(`[WEBSERIES] Deleted webseries: ${req.params.id}`);
    res.status(200).json({ message: 'Webseries deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
