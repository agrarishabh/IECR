import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";

const baseUrl = import.meta.env.VITE_BASE_URL;

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [sortKey, setSortKey] = useState("release_year");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-medium animate-slide-in-left heading-hover-cyan">Showing All Movies</h1>
        <select
          onChange={handleSortChange}
          value={`${sortKey}:${sortOrder}`}
          className="bg-gray-800 text-white px-3 py-2 rounded-md"
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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : movies.length > 0 ? (
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie._id || movie.id}
              movie={movie}
              style={{ animationDelay: `${index * 0.07}s` }}
            />
          ))}
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
