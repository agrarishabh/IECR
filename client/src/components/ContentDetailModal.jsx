import React, { useEffect, useState } from 'react';
import { X, Star, Play, Calendar, Clock, Tv, User, Users } from 'lucide-react';
import { getTmdbDetails } from '../lib/api';

const ContentDetailModal = ({ item, type, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!item) return;

    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';

    const fetchDetails = async () => {
      try {
        const data = await getTmdbDetails({
          title: item.title,
          year: item.release_year,
          type: type === 'movie' ? 'movie' : 'tv',
        });
        if (data.found) {
          setDetails(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      document.body.style.overflow = '';
    };
  }, [item, type]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${item.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-[#37C6CB] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Fetching details from TMDB...</p>
          </div>
        )}

        {/* ── Not found state ── */}
        {!loading && notFound && (
          <div className="p-8">
            {/* Show basic info from our DB even if TMDB lookup failed */}
            <img
              src={item.backdrop_path}
              alt={item.title}
              className="w-full h-56 object-cover rounded-xl mb-6"
            />
            <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{item.release_year}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" />{item.rating}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{item.votes} votes</span>
              {type === 'movie'
                ? <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{item.runtime}</span>
                : <span className="flex items-center gap-1"><Tv className="w-4 h-4" />{item.seasons} seasons</span>
              }
            </div>
            <p className="text-gray-500 text-sm italic">Extended details not available from TMDB for this title.</p>
          </div>
        )}

        {/* ── Full details state ── */}
        {!loading && details && (
          <>
            {/* Hero backdrop */}
            <div className="relative">
              <img
                src={details.backdrop_path || item.backdrop_path}
                alt={details.title}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent rounded-t-2xl" />
            </div>

            <div className="p-6">
              {/* Title + tagline */}
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{details.title}</h2>
              {details.tagline && (
                <p className="text-[#37C6CB] text-sm italic mt-1">"{details.tagline}"</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {details.release_date || details.first_air_date || item.release_year}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {details.rating} / 10
                  <span className="text-gray-500">({details.votes?.toLocaleString()} votes)</span>
                </span>
                {type === 'movie' && details.runtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {details.runtime} min
                  </span>
                )}
                {type === 'tv' && (
                  <span className="flex items-center gap-1">
                    <Tv className="w-4 h-4" />
                    {details.seasons} seasons · {details.episodes} episodes
                  </span>
                )}
              </div>

              {/* Genres */}
              {details.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {details.genres.map((g) => (
                    <span key={g} className="px-3 py-1 bg-gray-800 text-[#37C6CB] text-xs rounded-full border border-[#37C6CB]/30">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Director / Creator */}
              {(details.director || details.creator) && (
                <p className="mt-4 text-sm text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-gray-300 font-medium">
                    {type === 'movie' ? 'Director' : 'Creator'}:
                  </span>
                  {details.director || details.creator}
                </p>
              )}

              {/* Overview */}
              {details.overview && (
                <p className="mt-4 text-gray-300 text-sm leading-relaxed">{details.overview}</p>
              )}

              {/* Trailer */}
              {details.trailer_key && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#37C6CB]" /> Trailer
                  </h3>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${details.trailer_key}`}
                      title={`${details.title} Trailer`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Cast */}
              {details.cast?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#37C6CB]" /> Cast
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {details.cast.map((member) => (
                      <div key={member.id} className="flex-shrink-0 w-20 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
                          {member.profile_path ? (
                            <img
                              src={member.profile_path}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white mt-1 leading-tight font-medium line-clamp-2">{member.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{member.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentDetailModal;
