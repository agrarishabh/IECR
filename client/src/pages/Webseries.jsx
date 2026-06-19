import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import WebseriesCard from '../components/WebseriesCard';
import BlurCircle from '../components/BlurCircle';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import SkeletonCard from '../components/SkeletonCard';
import { getWebseries } from '../lib/api';

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

const Webseries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('release_year');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, sortKey, sortOrder]);

  const { data: webseriesList = [], isLoading, isError } = useQuery({
    queryKey: ['webseries'],
    queryFn: getWebseries,
  });

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const filteredAndSorted = useMemo(() => {
    let list = [...webseriesList];
    if (debouncedSearch) list = list.filter(w => w.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (filters.ratingMin !== '') list = list.filter(w => parseFloat(w.rating) >= parseFloat(filters.ratingMin));
    if (filters.ratingMax !== '') list = list.filter(w => parseFloat(w.rating) <= parseFloat(filters.ratingMax));
    if (filters.votesMin !== '') list = list.filter(w => parseVotes(w.votes) >= parseFloat(filters.votesMin.replace(/,/g, '')));
    if (filters.votesMax !== '') list = list.filter(w => parseVotes(w.votes) <= parseFloat(filters.votesMax.replace(/,/g, '')));
    if (filters.yearFrom !== '') list = list.filter(w => w.release_year >= parseInt(filters.yearFrom));
    if (filters.yearTo !== '') list = list.filter(w => w.release_year <= parseInt(filters.yearTo));

    return [...list].sort((a, b) => {
      let aVal, bVal;
      if (sortKey === 'rating') { aVal = parseFloat(a.rating) || 0; bVal = parseFloat(b.rating) || 0; }
      else if (sortKey === 'votes') { aVal = parseVotes(a.votes); bVal = parseVotes(b.votes); }
      else if (sortKey === 'seasons') { aVal = parseInt(a.seasons) || parseInt(a.number_of_seasons) || 0; bVal = parseInt(a.seasons) || parseInt(a.number_of_seasons) || 0; }
      else { aVal = a[sortKey]; bVal = b[sortKey]; }
      const diff = sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      return diff !== 0 ? diff : b.id - a.id;
    });
  }, [webseriesList, debouncedSearch, filters, sortKey, sortOrder]);

  const paginatedWebseries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const handleFilterChange = (e) => setDraftFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const applyFilters = () => {
    setFilters(draftFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
  };

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-lg font-medium animate-slide-in-left heading-hover-cyan">
          Showing All Webseries
          {filteredAndSorted.length !== webseriesList.length && (
            <span className="text-sm text-gray-400 ml-2">({filteredAndSorted.length} of {webseriesList.length})</span>
          )}
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search webseries..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white pl-9 pr-8 py-2 rounded-md border border-gray-700 focus:border-[#37C6CB] focus:outline-none transition-colors w-48 sm:w-56"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                <X className="w-4 h-4 text-gray-400 hover:text-white transition" />
              </button>
            )}
          </div>

          <select
            value={`${sortKey}:${sortOrder}`}
            onChange={e => { const [k, o] = e.target.value.split(':'); setSortKey(k); setSortOrder(o); }}
            className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:border-[#37C6CB] focus:outline-none"
          >
            <option value="release_year:desc">Year ↓</option>
            <option value="release_year:asc">Year ↑</option>
            <option value="rating:desc">Rating ↓</option>
            <option value="rating:asc">Rating ↑</option>
            <option value="votes:desc">Votes ↓</option>
            <option value="votes:asc">Votes ↑</option>
            <option value="seasons:desc">Seasons ↓</option>
            <option value="seasons:asc">Seasons ↑</option>
          </select>

          <div className="relative">
            <button
              onClick={() => { setShowFilters(!showFilters); setDraftFilters(filters); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                activeFilterCount > 0
                  ? 'border-[#37C6CB] text-[#37C6CB] bg-[#37C6CB]/10'
                  : 'border-gray-700 text-gray-400 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#37C6CB] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Card Dropdown */}
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-[#111] border border-[#333] rounded-xl p-5 shadow-2xl z-50 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold">Filter Webseries</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Rating Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Rating Min</label>
                      <input type="number" step="0.1" min="0" max="10" name="ratingMin" value={draftFilters.ratingMin} onChange={handleFilterChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="0" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Rating Max</label>
                      <input type="number" step="0.1" min="0" max="10" name="ratingMax" value={draftFilters.ratingMax} onChange={handleFilterChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="10" />
                    </div>
                  </div>

                  {/* Votes Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Votes Min</label>
                      <input type="text" name="votesMin" value={draftFilters.votesMin} onChange={handleFilterChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="1000" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Votes Max</label>
                      <input type="text" name="votesMax" value={draftFilters.votesMax} onChange={handleFilterChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="1M" />
                    </div>
                  </div>

                  {/* Year Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Year From</label>
                      <input type="number" min="1900" max="2030" name="yearFrom" value={draftFilters.yearFrom} onChange={handleFilterChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="2010" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Year To</label>
                      <input type="number" min="1900" max="2030" name="yearTo" value={draftFilters.yearTo} onChange={handleFilterChange} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#37C6CB] outline-none" placeholder="2024" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={resetFilters} className="flex-1 py-2 text-sm text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                    Clear
                  </button>
                  <button onClick={applyFilters} className="flex-1 py-2 text-sm text-black font-semibold bg-[#37C6CB] rounded-lg hover:bg-[#2faeb3] transition shadow-lg shadow-cyan-500/20">
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <p className="text-red-400">Failed to load webseries. Please try again.</p>
      ) : filteredAndSorted.length > 0 ? (
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {paginatedWebseries.map((ws, index) => (
              <WebseriesCard key={ws._id || ws.id} webseries={ws} style={{ animationDelay: `${(index % itemsPerPage) * 0.05}s` }} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition"
              >
                Previous
              </button>
              <span className="text-gray-400 px-4">
                Page <span className="text-white font-medium">{currentPage}</span> of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : debouncedSearch || activeFilterCount > 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <p className="text-gray-400 text-lg">No webseries match your search or filters.</p>
          <button onClick={() => { setSearchTerm(''); resetFilters(); }} className="text-[#37C6CB] text-sm underline cursor-pointer">
            Clear all
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <h1 className="text-3xl font-bold text-center">No webseries available</h1>
        </div>
      )}
    </div>
  );
};

export default Webseries;
