import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const baseUrl = import.meta.env.VITE_BASE_URL;

const DeleteForm = () => {
  const { getToken } = useAuth();
  const [type, setType] = useState('movie');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!id) return toast.error("Please enter an ID.");

    setLoading(true);
    try {
      const token = await getToken();
      const endpoint = type === 'movie'
        ? `${baseUrl}/api/movies/${id}`
        : `${baseUrl}/api/webseries/${id}`;

      await axios.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`${type === 'movie' ? 'Movie' : 'Webseries'} deleted successfully`);
      setId('');
    } catch (err) {
      toast.error(`Failed to delete: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-md mt-20">
      <h2 className="text-xl font-semibold text-white mb-4 heading-hover-cyan">Delete Movie or Webseries</h2>
      <form onSubmit={handleDelete} className="flex flex-col gap-4">
        <label className="text-white">
          Select Type:
          <select
            value={type} onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:outline-none"
          >
            <option value="movie">Movie</option>
            <option value="webseries">Webseries</option>
          </select>
        </label>
        <label className="text-white">
          Enter ID (_id):
          <input
            type="text" value={id} onChange={(e) => setId(e.target.value)}
            placeholder="Enter MongoDB _id"
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:outline-none"
          />
        </label>
        <button
          type="submit" disabled={loading}
          className="bg-[#37C6CB] hover:bg-red-700 disabled:opacity-50 text-white py-2 px-4 rounded transition-colors cursor-pointer"
        >
          {loading ? 'Deleting...' : `Delete ${type === 'movie' ? 'Movie' : 'Webseries'}`}
        </button>
      </form>
    </div>
  );
};

export default DeleteForm;
