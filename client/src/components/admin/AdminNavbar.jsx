import { Link } from 'react-router-dom';
import React from 'react';
import { assets } from '../../assets/assets';
import { useUser } from '@clerk/clerk-react';

const AdminNavbar = () => {
  const { user } = useUser();

  return (
    <div>
      <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30 bg-gray-900 text-white">
        <Link to="/">
          <img src={assets.logo} alt="IECR Logo" className="w-22 h-10" />
        </Link>
        <div className="flex gap-4">
          <Link to="/movies" className="px-3 py-1 rounded-md hover:bg-gray-700 transition text-sm md:text-base nav-link-hover">
            Movies
          </Link>
          <Link to="/webseries" className="px-3 py-1 rounded-md hover:bg-gray-700 transition text-sm md:text-base nav-link-hover">
            Webseries
          </Link>
        </div>
      </div>
      <div className="text-white">
        <img
          className="h-20 w-20 md:h-24 md:w-24 rounded-full mx-auto mt-10 object-cover"
          src={user?.imageUrl || assets.profile}
          alt="Admin"
        />
        <p className="text-center mt-2 text-base md:text-xl heading-hover-cyan">
          {user?.firstName} {user?.lastName}{' '}
          <span className="text-sm text-gray-400">(Admin)</span>
        </p>
      </div>
    </div>
  );
};

export default AdminNavbar;
