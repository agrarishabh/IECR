import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: String, ref: 'User', required: true },
  receiverId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  readStatus: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, readStatus: 1 }); // Useful for unread counts

const Message = mongoose.model('Message', messageSchema);
export default Message;
