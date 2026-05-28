import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import WebseriesCard from '../components/WebseriesCard';
import BlurCircle from '../components/BlurCircle';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

const baseUrl = import.meta.env.VITE_BASE_URL;

const MyWatchlist = () => {
  const [movieWatchlist, setMovieWatchlist] = useState([]);
  const [webseriesWatchlist, setWebseriesWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isLoaded || !user || !user.id) return;

      try {
        const token = await getToken();
        const { data } = await axios.get(`${baseUrl}/api/watchlist/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const movies = Array.isArray(data.movies) ? data.movies.filter(m => m && (m._id || m.id)) : [];
        const webseries = Array.isArray(data.webseries) ? data.webseries.filter(w => w && (w._id || w.id)) : [];

        setMovieWatchlist(movies);
        setWebseriesWatchlist(webseries);
      } catch (err) {
        console.error('Failed to fetch watchlist:', err?.response?.data || err.message || err);
        toast.error("Could not load watchlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, isLoaded, getToken]);

  const handleRate = async (contentId, type, rating) => {
    try {
      const token = await getToken();
      const body = { userId: user.id, rating };
      if (type === 'movie') body.movieId = contentId;
      else body.webseriesId = contentId;

      await axios.post(`${baseUrl}/api/watchlist/rate`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      if (type === 'movie') {
        setMovieWatchlist(prev =>
          prev.map(m => (m._id || String(m.id)) === contentId ? { ...m, userRating: rating } : m)
        );
      } else {
        setWebseriesWatchlist(prev =>
          prev.map(w => (w._id || String(w.id)) === contentId ? { ...w, userRating: rating } : w)
        );
      }

      toast.success(`Rated ${rating}/10`);
    } catch (err) {
      console.error('Rating error:', err);
      toast.error('Failed to rate');
    }
  };

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className='text-lg font-medium my-4 animate-slide-in-left heading-hover-cyan'>My Watchlist</h1>

      {/* Movies Section */}
      <div className='mb-10'>
        <h2 className='text-md font-semibold mb-2 animate-text-reveal heading-hover-cyan' style={{ animationDelay: '0.15s' }}>Movies</h2>
        {loading ? (
          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {movieWatchlist.length === 0 ? (
              <p className='text-gray-400 animate-fade-in'>No movies in your watchlist yet.</p>
            ) : (
              movieWatchlist.map((movie, index) => (
                <div key={movie._id || movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.07}s` }}>
                  <MovieCard
                    movie={movie}
                    isInWatchlist={true}
                  />
                  <div className="mt-2 flex items-center gap-1 px-1">
                    <span className="text-xs text-gray-400 mr-1">Rate:</span>
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRate(movie._id || String(movie.id), 'movie', i + 1)}
                        className={`w-6 h-6 rounded text-xs font-medium transition-all cursor-pointer ${
                          movie.userRating && i < movie.userRating
                            ? 'bg-[#37C6CB] text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Webseries Section */}
      <div>
        <h2 className='text-md font-semibold mb-2 animate-text-reveal heading-hover-cyan' style={{ animationDelay: '0.25s' }}>Webseries</h2>
        {loading ? (
          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {webseriesWatchlist.length === 0 ? (
              <p className='text-gray-400 animate-fade-in'>No webseries in your watchlist yet.</p>
            ) : (
              webseriesWatchlist.map((webseries, index) => (
                <div key={webseries._id || webseries.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.07}s` }}>
                  <WebseriesCard
                    webseries={webseries}
                    isInWatchlist={true}
                  />
                  <div className="mt-2 flex items-center gap-1 px-1">
                    <span className="text-xs text-gray-400 mr-1">Rate:</span>
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRate(webseries._id || String(webseries.id), 'webseries', i + 1)}
                        className={`w-6 h-6 rounded text-xs font-medium transition-all cursor-pointer ${
                          webseries.userRating && i < webseries.userRating
                            ? 'bg-[#37C6CB] text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyWatchlist;
