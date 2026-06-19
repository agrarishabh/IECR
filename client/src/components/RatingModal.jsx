import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import api from '../lib/api';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const RatingModal = ({ contentId, contentType, title, onClose, initialRating }) => {
  const { user } = useUser();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If we want to fetch the user's existing rating when modal opens
    if (user && !initialRating) {
      api.get(`/api/ratings/me`).then(({ data }) => {
        const myRatings = contentType === 'movie' ? data.movies : data.webseries;
        const existing = myRatings.find(item => String(item.contentId) === String(contentId));
        if (existing) setSelectedRating(existing.rating);
      }).catch(err => console.error('Failed to fetch initial rating', err));
    }
  }, [user, contentId, contentType, initialRating]);

  const handleRate = async (ratingValue) => {
    if (!user) {
      toast.error('Log in to rate!');
      return;
    }
    
    setSelectedRating(ratingValue);
    setIsSubmitting(true);
    
    try {
      await api.post('/api/ratings', {
        contentId,
        contentType,
        rating: ratingValue
      });
      toast.success('Rating saved!');
      setTimeout(() => onClose(), 500); // close after a short delay for UX
    } catch (err) {
      console.error(err);
      toast.error('Failed to save rating');
      setSelectedRating(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-sm flex flex-col shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-xl font-bold text-white truncate pr-4">Rate <span className="text-[#37C6CB] font-normal">{title}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          <p className="text-gray-400 mb-6 text-center text-sm">
            {user ? "How would you rate this?" : "Log in to leave a rating!"}
          </p>
          
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                disabled={!user || isSubmitting}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(star)}
                className={`transition-transform duration-200 ${!user || isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:scale-125'}`}
              >
                <Star
                  size={28}
                  fill={(hoverRating || selectedRating) >= star ? '#37C6CB' : 'transparent'}
                  color={(hoverRating || selectedRating) >= star ? '#37C6CB' : '#444'}
                  className="transition-colors duration-200"
                />
              </button>
            ))}
          </div>
          
          <div className="mt-4 h-6">
            {(hoverRating > 0 || selectedRating > 0) && (
              <p className="text-[#37C6CB] font-bold text-lg animate-fade-in-up">
                {hoverRating || selectedRating} / 10
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RatingModal;
