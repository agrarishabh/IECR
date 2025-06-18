import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, CheckCircle, CheckCircle2 } from 'lucide-react';

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();
    const [watchlist, setWatchlist] = useState(false);
    const [watched, setWatched] = useState(false);

    const handleWatchlist = () => setWatchlist(!watchlist);
    const handleWatched = () => setWatched(!watched);

    return (
        <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-66'>
            <img src={movie.backdrop_path} alt="" className='rounded-lg h-90 w-full object-cover object-right-bottom cursor-pointer'/>
            <p className='font-semibold mt-2 truncate'>{movie.title}</p>
            <p className='text-sm text-gray-400 mt-2'>
                {movie.release_year} • {movie.runtime} • {movie.rating} • {movie.votes}    
            </p>
            <div className="flex justify-between mt-3">
              
                <button onClick={handleWatchlist} className="flex items-center gap-2 text-sm">
                    {watchlist ? <BookmarkCheck className="w-5 h-5 text-yellow-400"/> : <Bookmark className="w-5 h-5 text-white"/>}
                    {watchlist ? "Added to Watchlist" : "Add to Watchlist"}
                </button>

                <button onClick={handleWatched} className="flex items-center gap-2 text-sm">
                    {watched ? <CheckCircle2 className="w-5 h-5 text-green-400"/> : <CheckCircle className="w-5 h-5 text-white"/>}
                    {watched ? "Watched" : "Mark as Watched"}
                </button>
            </div>
        </div>
    );
};

export default MovieCard;
