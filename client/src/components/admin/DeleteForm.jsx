import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DeleteForm = () => {
  const [type, setType] = useState('movie'); // or 'webseries'
  const [id, setId] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!id) {
      toast.error("Please enter an ID.");
      return;
    }

    try {
      const response = await axios.delete(`${VITE_BASE_URL}/${type}/${id}`);
      toast.success(`${type.toUpperCase()} deleted successfully`);
      setId('');
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${type}: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-md mt-20">
      <h2 className="text-xl font-semibold text-white mb-4">Delete Movie or Webseries</h2>
      <form onSubmit={handleDelete} className="flex flex-col gap-4">
        <label className="text-white">
          Select Type:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
          >
            <option value="movie">Movie</option>
            <option value="webseries">Webseries</option>
          </select>
        </label>

        <label className="text-white">
          Enter ID:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter MongoDB _id"
            className="w-full mt-1 p-2 rounded bg-gray-700 text-white"
          />
        </label>

        <button
          type="submit"
          className="bg-[#37C6CB] hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Delete {type}
        </button>
      </form>
    </div>
  );
};

export default DeleteForm;
