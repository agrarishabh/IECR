import mongoose from 'mongoose';
const webseriesSchema = new mongoose.Schema(
    {
    _id:{type: String, required: true},
    id : { type: Number, required: true },
    title: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_year: { type: Number, required: true },
    seasons: { type: Number, required: true },
    rating: { type: String, required: true },
    votes: { type: String, required: true }
    }
);
const Webseries = mongoose.model('Webseries', webseriesSchema);
export default Webseries;
