import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddWebseries = () => {
  const [formData, setFormData] = useState({
    _id: "",
    id: "",
    title: "",
    backdrop_path: "",
    release_year: "",
    seasons: "",
    rating: "",
    votes: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${VITE_BASE_URL}/addwebseries`, formData);
      toast.success("Webseries Added Successfully!");
      setFormData({
        _id: "",
        id: "",
        title: "",
        backdrop_path: "",
        release_year: "",
        seasons: "",
        rating: "",
        votes: "",
      });
    } catch (err) {
      console.error("Error adding webseries:", err);
      toast.error("Failed to add webseries");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-md mt-20 text-white">
      <h2 className="text-2xl font-bold text-center mb-6">Add Webseries</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { label: "_id", name: "_id", type: "text" },
          { label: "ID", name: "id", type: "number" },
          { label: "Title", name: "title", type: "text" },
          { label: "Poster URL", name: "backdrop_path", type: "text" },
          { label: "Release Year", name: "release_year", type: "number" },
          { label: "Seasons", name: "seasons", type: "number" },
          { label: "Rating", name: "rating", type: "text" },
          { label: "Votes", name: "votes", type: "text" }
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded"
        >
          Add Webseries
        </button>
      </form>
    </div>
  );
};

export default AddWebseries;
