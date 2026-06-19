import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/clerkAuth.js';
import { createError } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate);

// Get all notifications for user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) { next(err); }
});

// Mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

// Mark single as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return next(createError(404, "Notification not found"));
    res.status(200).json(notif);
  } catch (err) { next(err); }
});

// Delete a notification
router.delete('/:id', async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!notif) return next(createError(404, "Notification not found"));
    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
});

export default router;
