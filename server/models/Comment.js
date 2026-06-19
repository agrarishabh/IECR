import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  contentId: { type: String, required: true },
  contentType: { type: String, enum: ['movie', 'tv'], required: true },
  userId: { type: String, ref: 'User', required: true },
  text: { type: String, required: true },
}, { timestamps: true });

commentSchema.index({ contentId: 1, contentType: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
