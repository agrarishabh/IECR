import mongoose from 'mongoose';
const movieSchema = new mongoose.Schema(
    {
    _id:{type: String, required: true},
    id : { type: Number, required: true },
    title: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_year: { type: Number, required: true },
    runtime: { type: String, required: true },
    rating: { type: String, required: true },
    votes: { type: String, required: true }

    }
);
const Movie = mongoose.model('Movie', movieSchema);
export default Movie;

