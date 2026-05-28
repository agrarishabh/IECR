import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { Search, X } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import SkeletonCard from '../components/SkeletonCard';

const baseUrl = import.meta.env.VITE_BASE_URL;

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [sortKey, setSortKey] = useState("release_year");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const sortMovies = (list, key, order) => {
    return [...list].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "rating") {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (key === "votes") {
        aVal = parseInt((a.votes || "0").replace(/\D/g, ""));
        bVal = parseInt((b.votes || "0").replace(/\D/g, ""));
      }

      const primary = order === "asc" ? aVal - bVal : bVal - aVal;
      if (primary !== 0) return primary;

      // Secondary sort: within same value, sort by id descending
      return b.id - a.id;
    });
  };

  useEffect(() => {
    axios
      .get(`${baseUrl}/addmovies`)
      .then((res) => {
        // Default: release_year desc, then id desc within same year
        const sorted = sortMovies(res.data, "release_year", "desc");
        setMovies(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSortChange = (e) => {
    const [key, order] = e.target.value.split(":");
    setSortKey(key);
    setSortOrder(order);
    setMovies(sortMovies(movies, key, order));
  };

  const filteredMovies = debouncedSearch
    ? movies.filter(m => m.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : movies;

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-lg font-medium animate-slide-in-left heading-hover-cyan">Showing All Movies</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white pl-9 pr-8 py-2 rounded-md border border-gray-700 focus:border-[#37C6CB] focus:outline-none transition-colors w-48 sm:w-56"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                <X className="w-4 h-4 text-gray-400 hover:text-white transition" />
              </button>
            )}
          </div>
          <select
            onChange={handleSortChange}
            value={`${sortKey}:${sortOrder}`}
            className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700"
          >
            <option value="">Sort by</option>
            <option value="release_year:asc">Release Year ↑</option>
            <option value="release_year:desc">Release Year ↓</option>
            <option value="rating:asc">Rating ↑</option>
            <option value="rating:desc">Rating ↓</option>
            <option value="votes:asc">Votes ↑</option>
            <option value="votes:desc">Votes ↓</option>
            <option value="id:asc">ID ↑</option>
            <option value="id:desc">ID ↓</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {filteredMovies.map((movie, index) => (
            <MovieCard
              key={movie._id || movie.id}
              movie={movie}
              style={{ animationDelay: `${index * 0.07}s` }}
            />
          ))}
        </div>
      ) : debouncedSearch ? (
        <div className="flex flex-col items-center justify-center h-40">
          <h1 className="text-xl font-semibold text-center text-gray-400">No movies found for "{debouncedSearch}"</h1>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40">
          <h1 className="text-3xl font-bold text-center">No movies available</h1>
        </div>
      )}
    </div>
  );
};

export default Movies;
