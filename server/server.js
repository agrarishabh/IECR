import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import Movie from './models/Movie.js';
import Webseries from './models/Webseries.js';
import { requireAuth } from "@clerk/express";
import watchlistRoutes from './routes/watchlist.js';
const allowedOrigins = [
  'http://localhost:5173',
  'https://iecr.vercel.app'
];

const app = express();
const port = process.env.PORT || 3000;
await connectDB()
// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware())


//API Routes

app.use('/api/watchlist', watchlistRoutes);
app.get('/', (req,res)=>res.send('Server is Live'))
app.use('/api/inngest', serve({ client: inngest, functions }));
app.post("/addmovies",async (req, res) =>{
  try{
  const newMovie = new Movie(req.body);
  await newMovie.save();
  res.status(201).json(newMovie);
} catch(err){
  res.status(500).json({error: err.message});
}
});
app.get('/addmovies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/addwebseries",async (req, res) =>{
  try{
  const newWebseries = new Webseries(req.body);
  await newWebseries.save();
  res.status(201).json(newWebseries);
} catch(err){
  res.status(500).json({error: err.message});
}
});
app.get('/addwebseries', async (req, res) => {
  try {
    const webseries = await Webseries.find();
    res.status(200).json(webseries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// For deleting movie
app.delete('/movie/:id', async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For deleting webseries
app.delete('/webseries/:id', async (req, res) => {
  try {
    await Webseries.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Webseries deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});