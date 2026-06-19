import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true }, // The recipient of the notification
  type: { type: String, enum: ['friend_request', 'friend_accepted', 'message', 'watchlist_add', 'rating', 'comment'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed }, // e.g. { senderId: '...', contentId: '...' }
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
