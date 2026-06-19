import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import MovieCard from '../components/MovieCard';
import WebseriesCard from '../components/WebseriesCard';
import BlurCircle from '../components/BlurCircle';
import SkeletonCard from '../components/SkeletonCard';
import { useUser } from '@clerk/clerk-react';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { getWatchlist } from '../lib/api';
import { Link } from 'react-router-dom';

const DEFAULT_FILTERS = {
  ratingMin: '', ratingMax: '',
  votesMin: '', votesMax: '',
  yearFrom: '', yearTo: '',
};

const parseVotes = (v) => {
  if (!v) return 0;
  const s = String(v).replace(/,/g, '').trim();
  if (s.endsWith('M')) return parseFloat(s) * 1_000_000;
  if (s.endsWith('K')) return parseFloat(s) * 1_000;
  return parseFloat(s) || 0;
};

const sortItems = (list, sortKey, sortOrder) => {
  return [...list].sort((a, b) => {
    let aVal, bVal;
    if (sortKey === 'rating') { aVal = parseFloat(a.rating) || 0; bVal = parseFloat(b.rating) || 0; }
    else if (sortKey === 'votes') { aVal = parseVotes(a.votes); bVal = parseVotes(b.votes); }
    else if (sortKey === 'runtime') { aVal = parseInt(a.runtime) || 0; bVal = parseInt(b.runtime) || 0; }
    else if (sortKey === 'seasons') { aVal = a.seasons || 0; bVal = b.seasons || 0; }
    else { aVal = a[sortKey]; bVal = b[sortKey]; }
    const diff = sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    return diff !== 0 ? diff : b.id - a.id;
  });
};



const Section = ({ title, items, loading, isMovie, defaultSkeletons = 4 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('release_year');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const filtered = useMemo(() => {
    let list = [...items];
    if (debouncedSearch) list = list.filter(m => m.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (filters.ratingMin !== '') list = list.filter(m => parseFloat(m.rating) >= parseFloat(filters.ratingMin));
    if (filters.ratingMax !== '') list = list.filter(m => parseFloat(m.rating) <= parseFloat(filters.ratingMax));
    if (filters.votesMin !== '') list = list.filter(m => parseVotes(m.votes) >= parseFloat(filters.votesMin.replace(/,/g, '')));
    if (filters.votesMax !== '') list = list.filter(m => parseVotes(m.votes) <= parseFloat(filters.votesMax.replace(/,/g, '')));
    if (filters.yearFrom !== '') list = list.filter(m => m.release_year >= parseInt(filters.yearFrom));
    if (filters.yearTo !== '') list = list.filter(m => m.release_year <= parseInt(filters.yearTo));
    return sortItems(list, sortKey, sortOrder);
  }, [items, debouncedSearch, filters, sortKey, sortOrder]);

  return (
    <div className="mb-12">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-md font-semibold heading-hover-cyan">
          {title}
          <span className="text-sm text-gray-400 font-normal ml-2">({items.length})</span>
        </h2>

        {!loading && items.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text" placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white pl-8 pr-7 py-1.5 rounded-md border border-gray-600 focus:border-[#37C6CB] focus:outline-none text-sm w-40"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            {/* Sort */}
            <select
              value={`${sortKey}:${sortOrder}`}
              onChange={e => { const [k, o] = e.target.value.split(':'); setSortKey(k); setSortOrder(o); }}
              className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600 focus:border-[#37C6CB] focus:outline-none"
            >
              <option value="release_year:desc">Year ↓</option>
              <option value="release_year:asc">Year ↑</option>
              <option value="rating:desc">Rating ↓</option>
              <option value="rating:asc">Rating ↑</option>
              <option value="votes:desc">Votes ↓</option>
              <option value="votes:asc">Votes ↑</option>
              {isMovie
                ? <><option value="runtime:desc">Runtime ↓</option><option value="runtime:asc">Runtime ↑</option></>
                : <><option value="seasons:desc">Seasons ↓</option><option value="seasons:asc">Seasons ↑</option></>
              }
            </select>
            {/* Filter toggle */}
            <div className="relative">
              <button
                onClick={() => { setShowFilters(!showFilters); setDraftFilters(filters); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors cursor-pointer ${
                  activeFilterCount > 0
                    ? 'border-[#37C6CB] text-[#37C6CB] bg-[#37C6CB]/10'
                    : 'border-gray-600 text-gray-400 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#37C6CB] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Card Dropdown */}
              {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-[#111] border border-[#333] rounded-xl p-5 shadow-2xl z-50 animate-fade-in text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Filter {title}</h3>
                    <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Rating Row */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Rating Min</label>
                        <input type="number" step="0.1" min="0" max="10" name="ratingMin" value={draftFilters.ratingMin} onChange={e => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="0" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Rating Max</label>
                        <input type="number" step="0.1" min="0" max="10" name="ratingMax" value={draftFilters.ratingMax} onChange={e => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="10" />
                      </div>
                    </div>

                    {/* Votes Row */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Votes Min</label>
                        <input type="text" name="votesMin" value={draftFilters.votesMin} onChange={e => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="1000" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Votes Max</label>
                        <input type="text" name="votesMax" value={draftFilters.votesMax} onChange={e => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="1M" />
                      </div>
                    </div>

                    {/* Year Row */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Year From</label>
                        <input type="number" min="1900" max="2030" name="yearFrom" value={draftFilters.yearFrom} onChange={e => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="2010" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1">Year To</label>
                        <input type="number" min="1900" max="2030" name="yearTo" value={draftFilters.yearTo} onChange={e => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="2024" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => { setDraftFilters(DEFAULT_FILTERS); setFilters(DEFAULT_FILTERS); setShowFilters(false); }} className="flex-1 py-2 text-sm text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                      Clear
                    </button>
                    <button onClick={() => { setFilters(draftFilters); setShowFilters(false); }} className="flex-1 py-2 text-sm text-black font-semibold bg-[#37C6CB] rounded-lg hover:bg-[#2faeb3] transition shadow-lg shadow-cyan-500/20">
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {[...Array(defaultSkeletons)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-gray-400">Your {title.toLowerCase()} watchlist is empty.</p>
          <Link to={isMovie ? "/movies" : "/webseries"} className="text-[#37C6CB] underline hover:text-cyan-400">Browse {title}</Link>
        </div>      ) : filtered.length === 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-gray-400">No results match your search or filters.</p>
          <button onClick={() => { setSearchTerm(''); setFilters(DEFAULT_FILTERS); }} className="text-[#37C6CB] text-sm underline cursor-pointer w-fit">
            Clear all
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {filtered.map((item, index) => isMovie
            ? <MovieCard key={item._id || item.id} movie={item} style={{ animationDelay: `${index * 0.05}s` }} />
            : <WebseriesCard key={item._id || item.id} webseries={item} style={{ animationDelay: `${index * 0.05}s` }} />
          )}
        </div>
      )}
    </div>
  );
};

const MyWatchlist = () => {
  const { user, isLoaded } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
    enabled: !!user && isLoaded,
  });

  const movieWatchlist = data?.movies || [];
  const webseriesWatchlist = data?.webseries || [];

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className="text-lg font-medium my-4 animate-slide-in-left heading-hover-cyan">My Watchlist</h1>
      <Section title="Movies" items={movieWatchlist} loading={isLoading} isMovie={true} />
      <Section title="Webseries" items={webseriesWatchlist} loading={isLoading} isMovie={false} />
    </div>
  );
};

export default MyWatchlist;
