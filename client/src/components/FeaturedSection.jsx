import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import WebseriesCard from './WebseriesCard';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

const FeaturedSection = () => {
  const navigate = useNavigate();
  const [topMovies, setTopMovies] = useState([]);
  const [topWebseries, setTopWebseries] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingWebseries, setLoadingWebseries] = useState(true);

  useEffect(() => {
    // Fetch and sort movies by votes
    axios.get(`${baseUrl}/addmovies`)
      .then((res) => {
        const sortedMovies = res.data
          .filter(movie => movie.votes)
          .sort((a, b) => {
            const aVotes = parseInt((a.votes || "0").replace(/\D/g, ""));
            const bVotes = parseInt((b.votes || "0").replace(/\D/g, ""));
            return bVotes - aVotes;
          })
          .slice(0, 4);
        setTopMovies(sortedMovies);
      })
      .catch((err) => console.error('Failed to fetch movies:', err))
      .finally(() => setLoadingMovies(false));

    // Fetch and sort webseries by votes
    axios.get(`${baseUrl}/addwebseries`)
      .then((res) => {
        const sortedWebseries = res.data
          .filter(series => series.votes)
          .sort((a, b) => {
            const aVotes = parseInt((a.votes || "0").replace(/\D/g, ""));
            const bVotes = parseInt((b.votes || "0").replace(/\D/g, ""));
            return bVotes - aVotes;
          })
          .slice(0, 4);
        setTopWebseries(sortedWebseries);
      })
      .catch((err) => console.error('Failed to fetch webseries:', err))
      .finally(() => setLoadingWebseries(false));
  }, []);

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      {/* Top Movies */}
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' right='-80px' />
        <p className='text-gray-300 font-medium text-lg'>Most Rated Indian Movies</p>
        <button
          onClick={() => {
            navigate('/movies');
            scrollTo(0, 0);
          }}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'
        >
          View All
          <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>
      <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
        {loadingMovies ? (
          <div className="flex justify-center items-center w-full h-40">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topMovies.length > 0 ? (
          topMovies.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))
        ) : (
          <p className='text-gray-500'>No top rated movies available</p>
        )}
      </div>

      {/* Top Webseries */}
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' left='-160px' />
        <p className='text-gray-300 font-medium text-lg'>Most Rated Indian Webseries</p>
        <button
          onClick={() => {
            navigate('/webseries');
            scrollTo(0, 0);
          }}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'
        >
          View All
          <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>
      <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
        {loadingWebseries ? (
          <div className="flex justify-center items-center w-full h-40">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topWebseries.length > 0 ? (
          topWebseries.map((series) => (
            <WebseriesCard key={series._id || series.id} webseries={series} />
          ))
        ) : (
          <p className='text-gray-500'>No top rated webseries available</p>
        )}
      </div>
    </div>
  );
};

export default FeaturedSection;
