import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center'>
      <h1 className='text-8xl font-bold text-[#37C6CB]'>404</h1>
      <h2 className='text-2xl font-semibold text-white'>Page Not Found</h2>
      <p className='text-gray-400 max-w-md'>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to='/'
        onClick={() => scrollTo(0, 0)}
        className='px-6 py-2 bg-[#37C6CB] hover:bg-[#1FA9AF] transition rounded-full font-medium text-white'
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
