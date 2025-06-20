import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MovieCard = ({ movie, isInWatchlist }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist || false);
  const baseUrl = import.meta.env.VITE_BASE_URL

  const handleWatchlist = async () => {
    try {
      if (!user) return toast.error("Please log in");

      const token = await getToken();

      if (inWatchlist) {
        await axios.delete(`${baseUrl}/api/watchlist/remove`, {
          data: { userId: user.id, movieId: movie.id },
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Removed from watchlist");
      } else {
        await axios.post(`${baseUrl}/api/watchlist/add`, {
          userId: user.id,
          movie
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Added to watchlist");
      }

      setInWatchlist(!inWatchlist);
    } catch (err) {
      console.error("Watchlist error:", err);
      toast.error("Already in watchlist");
    }
  };

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-66'>
      <img
        src={movie.backdrop_path}
        alt={movie.title}
        className='rounded-lg h-90 w-full object-cover object-right-bottom cursor-pointer'
      />
      <p className='font-semibold mt-2 truncate'>{movie.title}</p>
      <p className='text-sm text-gray-400 mt-2'>
        {movie.release_year} • {movie.runtime} • {movie.rating} • {movie.votes}
      </p>
      <div className="flex justify-between mt-3">
        <button onClick={handleWatchlist} className="flex items-center gap-2 text-sm">
          {inWatchlist ? (
            <>
              <BookmarkCheck className="w-5 h-5 text-cyan-400" />
              <span>Added to Watchlist</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5 text-white" />
              <span>Add to Watchlist</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
