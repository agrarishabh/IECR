import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import WebseriesCard from '../components/WebseriesCard';
import BlurCircle from '../components/BlurCircle';
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

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className='text-lg font-medium my-4'>My Watchlist</h1>

      {/* Movies Section */}
      <div className='mb-10'>
        <h2 className='text-md font-semibold mb-2'>Movies</h2>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {movieWatchlist.length === 0 ? (
              <p className='text-gray-400'>No movies in your watchlist yet.</p>
            ) : (
              movieWatchlist.map(movie => (
                <MovieCard
                  key={movie._id || movie.id}
                  movie={movie}
                  isInWatchlist={true}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Webseries Section */}
      <div>
        <h2 className='text-md font-semibold mb-2'>Webseries</h2>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {webseriesWatchlist.length === 0 ? (
              <p className='text-gray-400'>No webseries in your watchlist yet.</p>
            ) : (
              webseriesWatchlist.map(webseries => (
                <WebseriesCard
                  key={webseries._id || webseries.id}
                  webseries={webseries}
                  isInWatchlist={true}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyWatchlist;
