import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Star, MessageCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import ContentDetailModal from './ContentDetailModal';
import CommentModal from './CommentModal';
import RatingModal from './RatingModal';
import { useWatchlist } from '../context/WatchlistContext';
import { addToWatchlistAPI, removeFromWatchlistAPI } from '../lib/api';

const MovieCard = ({ movie, style }) => {
  const { user } = useUser();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, getRating } = useWatchlist();

  const movieId = String(movie._id || movie.id);
  const inWatchlist = isInWatchlist(movieId);
  const userRating = getRating(movieId);

  const [bookmarkPulse, setBookmarkPulse] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loadingWL, setLoadingWL] = useState(false);

  const handleWatchlist = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Please log in');
    setLoadingWL(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlistAPI({ movieId });
        removeFromWatchlist(movieId);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlistAPI({ movie });
        addToWatchlist(movieId);
        toast.success('Added to watchlist');
      }
      setBookmarkPulse(true);
      setTimeout(() => setBookmarkPulse(false), 350);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already')) { addToWatchlist(movieId); }
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoadingWL(false);
    }
  };

  return (
    <>
      <div className="animate-fade-in-up" style={style}>
        <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl w-66 card-hover-glow">

          {/* Poster */}
          <div className="relative cursor-pointer group" onClick={() => setShowModal(true)}>
            <img
              loading="lazy"
              src={movie.backdrop_path}
              alt={movie.title}
              className="rounded-lg h-90 w-full object-cover object-center transition-opacity group-hover:opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">View Details</span>
            </div>
          </div>

          <p className="font-semibold mt-2 truncate">{movie.title}</p>
          <div className='flex items-center justify-between mt-3 text-sm text-gray-300 px-1'>
            <span className='font-medium text-[#37C6CB]'>{movie.release_year}</span>
            <span className='flex items-center gap-1'>
              <Star size={14} className='text-yellow-500 fill-yellow-500' />
              {movie.rating}
            </span>
            <span className="text-sm text-gray-300 opacity-70">{movie.votes} votes</span>
            <span className='text-sm text-gray-300 opacity-70'>{movie.runtime}</span>
          </div>

          <div className="flex items-center justify-start gap-5 mt-4 border-t border-gray-700 pt-3">
            {/* Watchlist button */}
            <button
              onClick={handleWatchlist}
              disabled={loadingWL}
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              className="flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50 hover:text-white"
            >
              {inWatchlist ? (
                <>
                  <BookmarkCheck className={`w-4 h-4 text-cyan-400 ${bookmarkPulse ? 'animate-bookmark-pulse' : ''}`} />
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>

            {/* Comment button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#37C6CB] transition-colors cursor-pointer"
            >
              <MessageCircle size={14} />
              <span>{movie.commentCount || 0}</span>
            </button>

            {/* Rate button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowRating(true); }}
              aria-label="Rate this movie"
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors cursor-pointer ${
                userRating
                  ? 'bg-[#37C6CB]/20 text-[#37C6CB] border border-[#37C6CB]/40'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <Star className="w-3 h-3" />
              {userRating ? `${userRating}/10` : 'Rate'}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ContentDetailModal
          item={movie}
          type="movie"
          onClose={() => setShowModal(false)}
        />
      )}

      {showComments && (
        <CommentModal 
          contentId={movieId} 
          contentType="movie" 
          title={movie.title} 
          onClose={() => setShowComments(false)} 
        />
      )}
      
      {showRating && (
        <RatingModal
          contentId={movieId}
          contentType="movie"
          title={movie.title}
          onClose={() => setShowRating(false)}
        />
      )}
    </>
  );
};

export default React.memo(MovieCard);
