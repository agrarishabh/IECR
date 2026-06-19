import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
  requesterId: { type: String, ref: 'User', required: true },
  recipientId: { type: String, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
}, { timestamps: true });

// Prevent duplicate friend requests between the same users
friendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

const Friend = mongoose.model('Friend', friendSchema);
export default Friend;
