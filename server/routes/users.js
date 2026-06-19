import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/clerkAuth.js';

const router = express.Router();

router.post('/sync', authenticate, async (req, res, next) => {
  const { name, email, image } = req.body;
  try {
    // Upsert ensures the user is created if they don't exist, or updated if they do
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, image },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'User synced successfully', user });
  } catch (err) {
    next(err);
  }
});

export default router;
