import express from 'express';
import Friend from '../models/Friend.js';
import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';
import Rating from '../models/Rating.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
import { authenticate } from '../middleware/clerkAuth.js';
import { createError } from '../middleware/errorHandler.js';
import { sendNotification } from '../utils/notify.js';

const router = express.Router();
router.use(authenticate);

// Search users by email to add as friend
router.get('/search', async (req, res, next) => {
  const { q } = req.query;
  if (!q) return res.status(200).json([]);
  try {
    const users = await User.find(
      { email: { $regex: q, $options: 'i' }, _id: { $ne: req.userId } },
      'name email image _id'
    ).limit(5);
    res.status(200).json(users);
  } catch (err) { next(err); }
});

// Send friend request
router.post('/request', async (req, res, next) => {
  const { recipientId } = req.body;
  if (req.userId === recipientId) return next(createError(400, "Cannot add yourself"));

  try {
    const existing = await Friend.findOne({
      $or: [
        { requesterId: req.userId, recipientId },
        { requesterId: recipientId, recipientId: req.userId }
      ]
    });

    if (existing) return next(createError(400, "Friend request already exists or you are already friends"));

    const newRequest = new Friend({ requesterId: req.userId, recipientId });
    await newRequest.save();

    const sender = await User.findOne({ _id: req.userId });
    await sendNotification(
      recipientId, 
      'friend_request', 
      `${sender?.name || 'Someone'} sent you a friend request.`,
      { senderId: req.userId }
    );

    res.status(200).json({ message: 'Friend request sent' });
  } catch (err) { next(err); }
});

// Accept friend request
router.post('/accept', async (req, res, next) => {
  const { requesterId } = req.body;
  try {
    const request = await Friend.findOneAndUpdate(
      { requesterId, recipientId: req.userId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!request) return next(createError(404, "Friend request not found"));

    const acceptor = await User.findOne({ _id: req.userId });
    await sendNotification(
      requesterId, 
      'friend_accepted', 
      `${acceptor?.name || 'Someone'} accepted your friend request.`,
      { acceptorId: req.userId }
    );

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) { next(err); }
});

// Reject/Remove friend
router.post('/remove', async (req, res, next) => {
  const { friendId } = req.body;
  try {
    await Friend.findOneAndDelete({
      $or: [
        { requesterId: req.userId, recipientId: friendId },
        { requesterId: friendId, recipientId: req.userId }
      ]
    });
    res.status(200).json({ message: 'Friend removed / Request cancelled' });
  } catch (err) { next(err); }
});

// Get accepted friends
router.get('/', async (req, res, next) => {
  try {
    const friends = await Friend.find({
      $or: [{ requesterId: req.userId }, { recipientId: req.userId }],
      status: 'accepted'
    });

    const friendIds = friends.map(f => f.requesterId === req.userId ? f.recipientId : f.requesterId);
    const users = await User.find({ _id: { $in: friendIds } }, 'name email image _id');
    res.status(200).json(users);
  } catch (err) { next(err); }
});

// Get pending requests (incoming and outgoing)
router.get('/pending', async (req, res, next) => {
  try {
    const incoming = await Friend.find({ recipientId: req.userId, status: 'pending' });
    const outgoing = await Friend.find({ requesterId: req.userId, status: 'pending' });

    const incomingUsers = await User.find({ _id: { $in: incoming.map(f => f.requesterId) } }, 'name email image _id');
    const outgoingUsers = await User.find({ _id: { $in: outgoing.map(f => f.recipientId) } }, 'name email image _id');

    res.status(200).json({ incoming: incomingUsers, outgoing: outgoingUsers });
  } catch (err) { next(err); }
});

// Middleware to check if users are friends
const checkFriendship = async (req, res, next) => {
  const { friendId } = req.params;
  const isFriend = await Friend.findOne({
    status: 'accepted',
    $or: [
      { requesterId: req.userId, recipientId: friendId },
      { requesterId: friendId, recipientId: req.userId }
    ]
  });
  if (!isFriend) return next(createError(403, "You are not friends with this user"));
  next();
};

// Get friend's watchlist
router.get('/:friendId/watchlist', checkFriendship, async (req, res, next) => {
  try {
    const list = await Watchlist.find({ userId: req.params.friendId }).populate('movieId').populate('webseriesId');
    const movies = list.filter(e => e.movieId).map(e => e.movieId);
    const webseries = list.filter(e => e.webseriesId).map(e => e.webseriesId);
    res.status(200).json({ movies, webseries });
  } catch (err) { next(err); }
});

// Get friend's ratings
router.get('/:friendId/ratings', checkFriendship, async (req, res, next) => {
  try {
    const ratings = await Rating.find({ userId: req.params.friendId });
    const movieRatings = ratings.filter(r => r.contentType === 'movie');
    const tvRatings = ratings.filter(r => r.contentType === 'tv');

    const [movies, webseries] = await Promise.all([
      Movie.find({ _id: { $in: movieRatings.map(r => r.contentId) } }),
      Webseries.find({ _id: { $in: tvRatings.map(r => r.contentId) } }),
    ]);

    const ratingMap = Object.fromEntries(ratings.map(r => [r.contentId, r.rating]));
    const ratedMovies = movies.map(m => ({ ...(m.toObject ? m.toObject() : m), userRating: ratingMap[m._id] }));
    const ratedWebseries = webseries.map(w => ({ ...(w.toObject ? w.toObject() : w), userRating: ratingMap[w._id] }));

    res.status(200).json({ movies: ratedMovies, webseries: ratedWebseries });
  } catch (err) { next(err); }
});

export default router;
