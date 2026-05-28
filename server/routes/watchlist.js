import express from 'express';
import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';

const router = express.Router();

// Add to watchlist (movie or webseries)
router.post('/add', async (req, res) => {
  const { userId, movie, webseries } = req.body;

  try {
    if (movie) {
      const movieId = String(movie.id);

      let existingMovie = await Movie.findOne({ _id: movieId });
      if (!existingMovie) {
        existingMovie = new Movie({ _id: movieId, ...movie });
        await existingMovie.save();
      }

      const exists = await Watchlist.findOne({ userId, movieId });
      if (exists) {
        return res.status(409).json({ message: "Movie already in watchlist." });
      }

      await new Watchlist({ userId, movieId }).save();
      return res.status(200).json({ message: "Movie added to watchlist." });
    }

    if (webseries) {
      const webseriesId = String(webseries.id);

      let existingWebseries = await Webseries.findOne({ _id: webseriesId });
      if (!existingWebseries) {
        existingWebseries = new Webseries({ _id: webseriesId, ...webseries });
        await existingWebseries.save();
      }

      const exists = await Watchlist.findOne({ userId, webseriesId });
      if (exists) {
        return res.status(409).json({ message: "Webseries already in watchlist." });
      }

      await new Watchlist({ userId, webseriesId }).save();
      return res.status(200).json({ message: "Webseries added to watchlist." });
    }

    res.status(400).json({ message: "Invalid request. Provide either movie or webseries data." });

  } catch (err) {
    console.error("Watchlist add error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get full watchlist
router.get('/:userId', async (req, res) => {
  try {
    const list = await Watchlist.find({ userId: req.params.userId })
      .populate('movieId')
      .populate('webseriesId');

    const movies = list
      .filter(entry => entry.movieId)
      .map(entry => ({
        ...(entry.movieId.toObject ? entry.movieId.toObject() : entry.movieId),
        userRating: entry.userRating || null,
      }));

    const webseries = list
      .filter(entry => entry.webseriesId)
      .map(entry => ({
        ...(entry.webseriesId.toObject ? entry.webseriesId.toObject() : entry.webseriesId),
        userRating: entry.userRating || null,
      }));

    res.status(200).json({ movies, webseries });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove from watchlist
router.delete('/remove', async (req, res) => {
  const { userId, movieId, webseriesId } = req.body;

  try {
    if (movieId) {
      await Watchlist.findOneAndDelete({ userId, movieId });
      return res.status(200).json({ message: "Movie removed from watchlist." });
    }

    if (webseriesId) {
      await Watchlist.findOneAndDelete({ userId, webseriesId });
      return res.status(200).json({ message: "Webseries removed from watchlist." });
    }

    res.status(400).json({ message: "Missing movieId or webseriesId in request body." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate a watchlist item
router.post('/rate', async (req, res) => {
  const { userId, movieId, webseriesId, rating } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (!rating || rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Rating must be between 1 and 10' });
  }
  if (!movieId && !webseriesId) {
    return res.status(400).json({ error: 'Provide either movieId or webseriesId' });
  }

  try {
    const query = { userId };
    if (movieId) query.movieId = movieId;
    if (webseriesId) query.webseriesId = webseriesId;

    const item = await Watchlist.findOneAndUpdate(
      query,
      { userRating: rating },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    res.status(200).json({ message: 'Rating updated successfully', item });
  } catch (err) {
    console.error('Rating error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
