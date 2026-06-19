import { ArrowRight } from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import WebseriesCard from './WebseriesCard';
import SkeletonCard from './SkeletonCard';
import { getMovies, getWebseries } from '../lib/api';

const parseVotes = (v) => {
  if (!v) return 0;
  const s = String(v).replace(/,/g, '').trim();
  if (s.endsWith('M')) return parseFloat(s) * 1_000_000;
  if (s.endsWith('K')) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
};

const FeaturedSection = () => {
  const navigate = useNavigate();

  // Both queries share the same cache as Movies/Webseries pages — zero extra requests
  const { data: movies = [], isLoading: loadingMovies } = useQuery({
    queryKey: ['movies'],
    queryFn: getMovies,
  });

  const { data: webseriesList = [], isLoading: loadingWebseries } = useQuery({
    queryKey: ['webseries'],
    queryFn: getWebseries,
  });

  const topMovies = useMemo(() =>
    [...movies]
      .sort((a, b) => parseVotes(b.votes) - parseVotes(a.votes))
      .slice(0, 5),
    [movies]
  );

  const topWebseries = useMemo(() =>
    [...webseriesList]
      .sort((a, b) => parseVotes(b.votes) - parseVotes(a.votes))
      .slice(0, 5),
    [webseriesList]
  );

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>

      {/* Top Movies */}
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' right='-80px' />
        <p className='text-gray-300 font-medium text-lg animate-slide-in-left heading-hover-cyan'>
          Most Voted Indian Movies
        </p>
        <button
          onClick={() => { navigate('/movies'); scrollTo(0, 0); }}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer animate-slide-in-right'
        >
          View All <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>
      <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
        {loadingMovies
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : topMovies.map((movie, index) => (
              <MovieCard key={movie._id || movie.id} movie={movie} style={{ animationDelay: `${index * 0.1}s` }} />
            ))
        }
      </div>

      {/* Top Webseries */}
      <div className='relative flex items-center justify-between pt-20 pb-10'>
        <BlurCircle top='0' left='-160px' />
        <p className='text-gray-300 font-medium text-lg animate-slide-in-left heading-hover-cyan' style={{ animationDelay: '0.2s' }}>
          Most Voted Indian Webseries
        </p>
        <button
          onClick={() => { navigate('/webseries'); scrollTo(0, 0); }}
          className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer animate-slide-in-right'
          style={{ animationDelay: '0.2s' }}
        >
          View All <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
        </button>
      </div>
      <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
        {loadingWebseries
          ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
          : topWebseries.map((series, index) => (
              <WebseriesCard key={series._id || series.id} webseries={series} style={{ animationDelay: `${index * 0.1}s` }} />
            ))
        }
      </div>
    </div>
  );
};

export default FeaturedSection;
