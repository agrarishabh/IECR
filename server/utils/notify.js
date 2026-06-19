import Notification from '../models/Notification.js';
import Friend from '../models/Friend.js';
import User from '../models/User.js';
import { getIo, getSocketId } from '../socket.js';

/**
 * Creates a notification in the database and emits it via WebSockets if the user is online.
 * @param {string} userId - The recipient user ID
 * @param {string} type - Notification type (e.g., 'friend_request', 'message', 'watchlist_add', 'rating', 'comment')
 * @param {string} message - Notification text
 * @param {Object} metadata - Extra data (e.g., senderId, contentId)
 */
export const sendNotification = async (userId, type, message, metadata = {}) => {
  try {
    // 1. Save to DB
    const notif = new Notification({
      userId,
      type,
      message,
      metadata
    });
    await notif.save();

    // 2. Emit via socket if user is online
    const socketId = getSocketId(userId);
    if (socketId) {
      const io = getIo();
      io.to(socketId).emit('new_notification', notif);
    }
    
    return notif;
  } catch (err) {
    console.error('[NOTIFY ERROR]', err);
  }
};

/**
 * Notifies all friends of a given user.
 */
export const notifyFriends = async (userId, type, messageTemplate, metadata = {}) => {
  try {
    const friends = await Friend.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'accepted'
    });

    if (friends.length === 0) return;

    const sender = await User.findOne({ _id: userId });
    const senderName = sender?.name || 'A friend';
    const finalMessage = messageTemplate.replace('{name}', senderName);

    for (const friend of friends) {
      const friendId = friend.requesterId === userId ? friend.recipientId : friend.requesterId;
      await sendNotification(friendId, type, finalMessage, { ...metadata, senderId: userId });
    }
  } catch (err) {
    console.error('[NOTIFY FRIENDS ERROR]', err);
  }
};
