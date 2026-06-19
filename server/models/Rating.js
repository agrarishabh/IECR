import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  contentId: { type: String, required: true },   // Movie._id or Webseries._id
  contentType: { type: String, enum: ['movie', 'tv'], required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
}, { timestamps: true });

// One rating per user per content item
ratingSchema.index({ userId: 1, contentId: 1, contentType: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
