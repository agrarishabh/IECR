import { Link } from 'react-router-dom';
import React from 'react';
import { assets } from '../../assets/assets';

const AdminNavbar = () => {
  const user = {
    firstName: 'Rishabh',
    lastName: 'Agrahari',
    imageUrl: assets.profile,
  };

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30 bg-gray-900 text-white">
        <Link to="/">
          <img src={assets.logo} alt="logo" className="w-22 h-10" />
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4">
          <Link
            to="/movies"
            className="px-3 py-1 rounded-md hover:bg-gray-700 transition text-sm md:text-base"
          >
            Movies
          </Link>
          <Link
            to="/webseries"
            className="px-3 py-1 rounded-md hover:bg-gray-700 transition text-sm md:text-base"
          >
            Webseries
          </Link>
        </div>
      </div>

      {/* Profile Section */}
      <div className="text-white">
        <img
          className="h-20 w-20 md:h-24 md:w-24 rounded-full mx-auto mt-10"
          src={user.imageUrl}
          alt="Admin"
        />
        <p className="text-center mt-2 text-base md:text-xl">
          {user.firstName} {user.lastName} <span className="text-sm text-gray-400">(Admin)</span>
        </p>
      </div>
    </div>
  );
};
export default AdminNavbar;
