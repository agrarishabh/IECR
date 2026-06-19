import express from 'express';
import Message from '../models/Message.js';
import Friend from '../models/Friend.js';
import { authenticate } from '../middleware/clerkAuth.js';
import { createError } from '../middleware/errorHandler.js';
import { sendNotification } from '../utils/notify.js';
import { getIo, getSocketId } from '../socket.js';

const router = express.Router();
router.use(authenticate);

// Middleware to check if users are friends
const checkFriendship = async (req, res, next) => {
  const friendId = req.params.friendId || req.body.receiverId;
  const isFriend = await Friend.findOne({
    status: 'accepted',
    $or: [
      { requesterId: req.userId, recipientId: friendId },
      { requesterId: friendId, recipientId: req.userId }
    ]
  });
  if (!isFriend) return next(createError(403, "You can only message friends"));
  next();
};

// Get chat history with a specific friend
router.get('/:friendId', checkFriendship, async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: req.params.friendId },
        { senderId: req.params.friendId, receiverId: req.userId }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) { next(err); }
});

// Send a message
router.post('/', checkFriendship, async (req, res, next) => {
  const { receiverId, content } = req.body;
  if (!content) return next(createError(400, "Message content is required"));

  try {
    const newMsg = new Message({ senderId: req.userId, receiverId, content });
    await newMsg.save();

    // Emit via WebSockets for real-time chat
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      const io = getIo();
      io.to(receiverSocketId).emit('receive_message', newMsg);
    }

    // Optionally send a notification for the message
    let senderName = 'Someone';
    try {
      const sender = await import('../models/User.js').then(m => m.default.findById(req.userId));
      if (sender) senderName = sender.name;
    } catch(e) {}

    await sendNotification(
      receiverId,
      'message',
      `${senderName} messaged you.`,
      { senderId: req.userId, messageId: newMsg._id }
    );

    res.status(201).json(newMsg);
  } catch (err) { next(err); }
});

// Mark messages as read
router.put('/read/:friendId', async (req, res, next) => {
  try {
    await Message.updateMany(
      { senderId: req.params.friendId, receiverId: req.userId, readStatus: false },
      { $set: { readStatus: true } }
    );
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) { next(err); }
});

export default router;
