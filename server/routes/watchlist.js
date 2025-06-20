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
      let existingMovie = await Movie.findOne({ id: movie.id });
      if (!existingMovie) {
        existingMovie = new Movie({ _id: movie.id.toString(), ...movie });
        await existingMovie.save();
      }

      const entry = new Watchlist({ userId, movieId: movie.id });
      await entry.save();

      return res.status(200).json({ message: "Movie added to watchlist." });
    }

    if (webseries) {
      let existingWebseries = await Webseries.findOne({ id: webseries.id });
      if (!existingWebseries) {
        existingWebseries = new Webseries({ _id: webseries.id.toString(), ...webseries });
        await existingWebseries.save();
      }

      const entry = new Watchlist({ userId, webseriesId: webseries.id });
      await entry.save();

      return res.status(200).json({ message: "Webseries added to watchlist." });
    }

    res.status(400).json({ message: "Invalid request. Provide either movie or webseries data." });

  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: "Already in watchlist." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Get full watchlist
router.get('/:userId', async (req, res) => {
  try {
    const list = await Watchlist.find({ userId: req.params.userId })
      .populate('movieId')
      .populate('webseriesId');

    // Separate movie and webseries entries
    const movies = list
      .filter(entry => entry.movieId)
      .map(entry => entry.movieId);

    const webseries = list
      .filter(entry => entry.webseriesId)
      .map(entry => entry.webseriesId);

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

export default router;
