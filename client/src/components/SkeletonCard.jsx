import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="p-3 bg-gray-800 rounded-2xl w-66 animate-pulse">
      <div className="rounded-lg h-90 w-full bg-gray-700" />
      <div className="h-4 bg-gray-700 rounded-md mt-3 w-3/4" />
      <div className="h-3 bg-gray-700 rounded-md mt-2 w-full" />
      <div className="flex items-center gap-2 mt-3">
        <div className="h-5 w-5 bg-gray-700 rounded" />
        <div className="h-3 bg-gray-700 rounded-md w-28" />
      </div>
    </div>
  );
};

export default SkeletonCard;
