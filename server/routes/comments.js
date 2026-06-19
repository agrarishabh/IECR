import express from 'express';
import Comment from '../models/Comment.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
import Friend from '../models/Friend.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/clerkAuth.js';
import { createError } from '../middleware/errorHandler.js';
import { notifyFriends } from '../utils/notify.js';

const router = express.Router();
router.use(authenticate);

// Get comments for a specific content
router.get('/:contentType/:contentId', async (req, res, next) => {
  try {
    const comments = await Comment.find({ 
      contentType: req.params.contentType, 
      contentId: req.params.contentId 
    }).populate('userId', 'name image _id').sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (err) { next(err); }
});

// Add a comment
router.post('/', async (req, res, next) => {
  const { contentId, contentType, text } = req.body;
  if (!contentId || !contentType || !text) {
    return next(createError(400, "contentId, contentType, and text are required"));
  }

  try {
    const newComment = new Comment({
      contentId,
      contentType,
      userId: req.userId,
      text
    });
    await newComment.save();
    
    // Populate user info before returning
    await newComment.populate('userId', 'name image _id');

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

    // Notify all friends
    await notifyFriends(
      req.userId,
      'comment',
      `{name} commented on ${contentName}.`,
      { contentId, contentType, commentId: newComment._id }
    );

    res.status(201).json(newComment);
  } catch (err) { next(err); }
});

// Delete a comment
router.delete('/:id', async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(createError(404, "Comment not found"));
    if (comment.userId.toString() !== req.userId) {
      return next(createError(403, "You can only delete your own comments"));
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
});

export default router;
