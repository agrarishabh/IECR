import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const baseUrl = import.meta.env.VITE_BASE_URL;

const UpdateWebseries = () => {
  const [webseriesId, setWebseriesId] = useState("");
  const [formData, setFormData] = useState({
    backdrop_path: "",
    seasons: "",
    rating: "",
    votes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!webseriesId) {
      toast.error("Please enter a Webseries ID (_id)");
      return;
    }
    setLoading(true);
    try {
      const updateData = {};
      if (formData.backdrop_path) updateData.backdrop_path = formData.backdrop_path;
      if (formData.seasons) updateData.seasons = Number(formData.seasons);
      if (formData.rating) updateData.rating = formData.rating;
      if (formData.votes) updateData.votes = formData.votes;

      if (Object.keys(updateData).length === 0) {
        toast.error("Please fill at least one field to update");
        setLoading(false);
        return;
      }

      await axios.put(`${baseUrl}/webseries/${webseriesId}`, updateData);
      toast.success("Webseries Updated Successfully!");
      setWebseriesId("");
      setFormData({ backdrop_path: "", seasons: "", rating: "", votes: "" });
    } catch (err) {
      console.error("Error updating webseries:", err);
      toast.error(err.response?.data?.error || "Failed to update webseries");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-md mt-20 text-white animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-6 heading-hover-cyan">Update Webseries</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1">Webseries ID (_id)</label>
          <input
            type="text"
            value={webseriesId}
            onChange={(e) => setWebseriesId(e.target.value)}
            placeholder="Enter webseries _id to update"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
            required
          />
        </div>

        {[
          { label: "Poster URL", name: "backdrop_path", type: "text" },
          { label: "Seasons", name: "seasons", type: "number" },
          { label: "Rating", name: "rating", type: "text" },
          { label: "Votes", name: "votes", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={`Enter new ${label.toLowerCase()}`}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors cursor-pointer"
        >
          {loading ? "Updating..." : "Update Webseries"}
        </button>
      </form>
    </div>
  );
};

export default UpdateWebseries;
