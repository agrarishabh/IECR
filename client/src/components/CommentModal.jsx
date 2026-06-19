import React, { useState, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const CommentModal = ({ contentId, contentType, title, onClose }) => {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/api/comments/${contentType}/${contentId}`);
        setComments(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [contentId, contentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const { data } = await api.post('/api/comments', {
        contentId,
        contentType,
        text: newComment
      });
      // Add to top since sorted by newest
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-xl font-bold text-white truncate pr-4">Comments: <span className="text-[#37C6CB] font-normal">{title}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => (
              <div key={c._id} className="flex gap-3">
                <img src={c.userId?.image || '/default-avatar.png'} alt={c.userId?.name} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                <div className="flex-1 bg-[#1a1a1a] rounded-2xl rounded-tl-sm p-3 relative group border border-[#2a2a2a]">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-[#37C6CB]">{c.userId?.name}</p>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-200 break-words">{c.text}</p>
                  
                  {/* Delete button (only if it's user's own comment, Clerk user id might be mapped to mongo _id, but we rely on error to block if not, or check if image matches for UI simplicity) */}
                  {user && (
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="absolute -right-2 -top-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        {user ? (
          <div className="p-4 border-t border-[#222] bg-[#0a0a0a]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-white outline-none focus:border-[#37C6CB] transition"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="bg-[#37C6CB] text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#1fa9af] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 border-t border-[#222] bg-[#0a0a0a] text-center">
            <p className="text-sm text-gray-500">Log in to leave a comment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
