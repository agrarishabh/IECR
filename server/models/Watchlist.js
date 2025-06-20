import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  movieId: {
    type: String, // Same type as Movie._id
    ref: 'Movie',
  },
  webseriesId: {
    type: String, // Same type as Webseries._id
    ref: 'Webseries',
  }
}, { timestamps: true });

// Unique index for movie entries
watchlistSchema.index(
  { userId: 1, movieId: 1 },
  {
    unique: true,
    partialFilterExpression: { movieId: { $exists: true } },
  }
);

// Unique index for webseries entries
watchlistSchema.index(
  { userId: 1, webseriesId: 1 },
  {
    unique: true,
    partialFilterExpression: { webseriesId: { $exists: true } },
  }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);
export default Watchlist;
