import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MovieCard = ({ movie, isInWatchlist, style }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist || false);
  const [bookmarkPulse, setBookmarkPulse] = useState(false);
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

      setBookmarkPulse(true);
      setTimeout(() => setBookmarkPulse(false), 350);
      setInWatchlist(!inWatchlist);
    } catch (err) {
      console.error("Watchlist error:", err);
      toast.error("Already in watchlist");
    }
  };

  return (
    <div
      className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl w-66 card-hover-glow animate-fade-in-up'
      style={style}
    >
      <img
        src={movie.backdrop_path}
        alt={movie.title}
        className='rounded-lg h-90 w-full object-cover object-center cursor-pointer'
      />
      <p className='font-semibold mt-2 truncate'>{movie.title}</p>
      <p className='text-sm text-gray-400 mt-2'>
        ID: {movie.id} • {movie.release_year} • {movie.runtime} • {movie.rating} • {movie.votes}
      </p>
      <div className="flex justify-between mt-3">
        <button onClick={handleWatchlist} className="flex items-center gap-2 text-sm cursor-pointer">
          {inWatchlist ? (
            <>
              <BookmarkCheck className={`w-5 h-5 text-cyan-400 ${bookmarkPulse ? 'animate-bookmark-pulse' : ''}`} />
              <span>Added to Watchlist</span>
            </>
          ) : (
            <>
              <Bookmark className={`w-5 h-5 text-white ${bookmarkPulse ? 'animate-bookmark-pulse' : ''}`} />
              <span>Add to Watchlist</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
