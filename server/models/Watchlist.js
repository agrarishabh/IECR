import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'User' },
  movieId: { type: String, ref: 'Movie' },
  webseriesId: { type: String, ref: 'Webseries' },
}, { timestamps: true });

// Unique index — one entry per user per movie
watchlistSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true, partialFilterExpression: { movieId: { $type: 'string' } } }
);

// Unique index — one entry per user per webseries
watchlistSchema.index(
  { userId: 1, webseriesId: 1 },
  { unique: true, partialFilterExpression: { webseriesId: { $type: 'string' } } }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
