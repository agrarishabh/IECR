import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useSocket } from '../context/SocketContext';

import { Search, UserPlus, Check, X, MessageSquare, Star, Clock, ListVideo } from 'lucide-react';
import toast from 'react-hot-toast';
import MovieCard from '../components/MovieCard';
import WebseriesCard from '../components/WebseriesCard';
import { useLocation } from 'react-router-dom';

const ProfileHub = () => {

  const { socket } = useSocket();
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState({ incoming: [], outgoing: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'sent'
  const [selectedFriend, setSelectedFriend] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Right sidebar view mode: 'chat', 'watchlist', 'ratings'
  const [viewMode, setViewMode] = useState('chat'); 
  const [friendContent, setFriendContent] = useState({ movies: [], webseries: [] });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab) setActiveTab(location.state.activeTab);
      if (location.state.viewMode) setViewMode(location.state.viewMode);
      if (location.state.selectedFriendId && friends.length > 0) {
        const f = friends.find(fr => fr._id === location.state.selectedFriendId);
        if (f) setSelectedFriend(f);
      }
    }
  }, [location.state, friends]);

  useEffect(() => {
    if (selectedFriend && viewMode === 'chat') {
      fetchMessages(selectedFriend._id);
    } else if (selectedFriend && (viewMode === 'watchlist' || viewMode === 'ratings')) {
      fetchFriendContent(selectedFriend._id, viewMode);
    }
  }, [selectedFriend, viewMode]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (msg) => {
        if (selectedFriend && (msg.senderId === selectedFriend._id || msg.receiverId === selectedFriend._id)) {
          setMessages(prev => [...prev, msg]);
        } else {
          toast.success('New message received!');
        }
      });
    }
    return () => {
      if (socket) socket.off('receive_message');
    };
  }, [socket, selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const fetchFriends = async () => {
    try {
      const { data } = await api.get('/api/friends');
      setFriends(data);
    } catch (err) { console.error(err); }
  };

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/api/friends/pending');
      setPending(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (friendId) => {
    try {
      const { data } = await api.get(`/api/messages/${friendId}`);
      setMessages(data);
      await api.put(`/api/messages/read/${friendId}`);
    } catch (err) { console.error(err); }
  };

  const fetchFriendContent = async (friendId, type) => {
    try {
      const { data } = await api.get(`/api/friends/${friendId}/${type}`);
      setFriendContent(data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const { data } = await api.get(`/api/friends/search?q=${searchQuery}`);
      setSearchResults(data);
      setHasSearched(true);
    } catch (err) { 
      console.error(err);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const sendFriendRequest = async (recipientId) => {
    try {
      await api.post('/api/friends/request', { recipientId });
      toast.success('Friend request sent');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (requesterId) => {
    try {
      await api.post('/api/friends/accept', { requesterId });
      toast.success('Request accepted');
      fetchPending();
      fetchFriends();
    } catch (err) { console.error(err); }
  };

  const rejectRequest = async (friendId) => {
    try {
      await api.post('/api/friends/remove', { friendId });
      toast.success('Request removed');
      fetchPending();
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;
    try {
      const { data } = await api.post('/api/messages', {
        receiverId: selectedFriend._id,
        content: newMessage
      });
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="pt-24 px-6 md:px-8 lg:px-16 xl:px-24 min-h-screen text-white bg-black">
      
      <div className="text-center mb-8 w-full">
        <h1 className="text-3xl font-bold text-[#37C6CB] drop-shadow-[0_0_10px_#37C6CB]">Social Hub</h1>
      </div>

      {/* 3 Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-[75vh]">
        
        {/* LEFT COLUMN: Tabs (Friends, Requests, Request Sent) */}
        <div className="w-full lg:w-1/3 bg-white/5 border border-gray-700 rounded-xl p-4 flex flex-col backdrop-blur">
          <div className="flex w-full mb-4 border-b border-gray-700">
            <button className={`flex-1 pb-2 text-sm whitespace-nowrap text-center ${activeTab === 'friends' ? 'text-[#37C6CB] border-b-2 border-[#37C6CB] font-semibold' : 'text-gray-400 hover:text-gray-200'}`} onClick={() => setActiveTab('friends')}>Friends</button>
            <button className={`flex-1 pb-2 text-sm whitespace-nowrap text-center ${activeTab === 'requests' ? 'text-[#37C6CB] border-b-2 border-[#37C6CB] font-semibold' : 'text-gray-400 hover:text-gray-200'}`} onClick={() => setActiveTab('requests')}>Requests</button>
            <button className={`flex-1 pb-2 text-sm whitespace-nowrap text-center ${activeTab === 'sent' ? 'text-[#37C6CB] border-b-2 border-[#37C6CB] font-semibold' : 'text-gray-400 hover:text-gray-200'}`} onClick={() => setActiveTab('sent')}>Request Sent</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'friends' && (
              <div className="space-y-2">
                {friends.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">No friends yet.</p> :
                  friends.map(f => (
                    <div 
                      key={f._id} 
                      onClick={() => { setSelectedFriend(f); setViewMode('chat'); }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedFriend?._id === f._id ? 'bg-[#37C6CB]/20 border border-[#37C6CB]/50 shadow-[0_0_10px_rgba(55,198,203,0.1)]' : 'hover:bg-white/10 border border-transparent'}`}
                    >
                      <img src={f.image || '/default-avatar.png'} alt={f.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                      <p className="font-medium truncate flex-1">{f.name}</p>
                    </div>
                  ))
                }
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-3">
                {pending.incoming.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">No incoming requests.</p> :
                  pending.incoming.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-black/40 border border-[#222] rounded-xl mb-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={p.image} className="w-10 h-10 rounded-full border border-gray-700" />
                        <p className="text-sm font-medium truncate w-24">{p.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => acceptRequest(p._id)} className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded-full hover:bg-green-500 hover:text-black transition"><Check size={16}/></button>
                        <button onClick={() => rejectRequest(p._id)} className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-black transition"><X size={16}/></button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {activeTab === 'sent' && (
              <div className="space-y-3">
                {pending.outgoing.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">No outgoing requests.</p> :
                  pending.outgoing.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-3 bg-black/40 border border-[#222] rounded-xl mb-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={p.image} className="w-10 h-10 rounded-full border border-gray-700" />
                        <p className="text-sm font-medium truncate w-24">{p.name}</p>
                      </div>
                      <button onClick={() => rejectRequest(p._id)} className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline transition">Cancel</button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Search & Results */}
        <div className="w-full lg:w-1/3 bg-white/5 border border-gray-700 rounded-xl p-4 flex flex-col backdrop-blur">
          <h2 className="text-lg font-bold mb-4 text-white text-center">Find Users</h2>
          <form onSubmit={handleSearch} className="w-full relative mb-4">
            <input 
              type="text" 
              placeholder="Search by email..." 
              className="w-full bg-[#111] border border-gray-700 rounded-full pl-10 pr-10 py-2 outline-none focus:border-[#37C6CB] transition-colors text-sm"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                <X size={14} />
              </button>
            )}
            <button type="submit" disabled={isSearching} className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#37C6CB] text-black p-1.5 rounded-full disabled:opacity-50 hover:bg-[#2faeb3] transition">
              <Search size={14}/>
            </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {!hasSearched ? (
               <div className="flex-1 flex items-center justify-center text-gray-500 text-sm h-full">Search for friends by email</div>
            ) : isSearching ? (
               <p className="text-gray-500 text-center py-8 text-sm">Searching...</p>
            ) : searchResults.length === 0 ? (
               <p className="text-gray-500 text-center py-8 text-sm">No users found.</p>
            ) : (
              searchResults.map(res => (
                <div key={res._id} className="flex items-center justify-between p-3 bg-black/40 border border-[#222] rounded-lg hover:border-[#37C6CB] transition">
                  <div className="flex items-center gap-3">
                    <img src={res.image} className="w-10 h-10 rounded-full" />
                    <p className="font-medium text-sm">{res.name}</p>
                  </div>
                  <button onClick={() => sendFriendRequest(res._id)} className="flex items-center gap-2 bg-[#37C6CB] text-black px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#2faeb3] transition">
                    <UserPlus size={14}/> Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Friend Details (Chat, Watchlist, Ratings) */}
        <div className="w-full lg:w-1/3 bg-[#0a0a0a] border border-[#222] rounded-xl p-4 flex flex-col shadow-2xl relative overflow-hidden">
          {!selectedFriend ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <p className="font-medium text-lg text-gray-400">Select a friend</p>
              <p className="text-sm mt-1">Chat or view their watchlist and ratings</p>
            </div>
          ) : (
            <>
              {/* Friend Header */}
              <div className="flex flex-col items-center justify-center border-b border-[#222] pb-4 mb-4 gap-3 relative">
                <button onClick={() => setSelectedFriend(null)} className="absolute right-0 top-0 text-gray-500 hover:text-white transition">
                  <X size={18} />
                </button>
                <img src={selectedFriend.image} className="w-16 h-16 rounded-full border-2 border-[#37C6CB] shadow-[0_0_15px_rgba(55,198,203,0.3)]" />
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">{selectedFriend.name}</h2>
                  <p className="text-xs text-[#37C6CB]">Connected</p>
                </div>
                <div className="flex w-full bg-[#111] rounded-lg p-1 border border-[#333]">
                  <button onClick={() => setViewMode('chat')} className={`flex-1 py-1.5 text-xs rounded-md transition font-medium ${viewMode === 'chat' ? 'bg-[#37C6CB] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Chat</button>
                  <button onClick={() => setViewMode('watchlist')} className={`flex-1 py-1.5 text-xs rounded-md transition font-medium ${viewMode === 'watchlist' ? 'bg-[#37C6CB] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Watchlist</button>
                  <button onClick={() => setViewMode('ratings')} className={`flex-1 py-1.5 text-xs rounded-md transition font-medium ${viewMode === 'ratings' ? 'bg-[#37C6CB] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Ratings</button>
                </div>
              </div>

              {/* Chat View */}
              {viewMode === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] p-4">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-600 text-sm">No messages yet. Say hi!</div>
                    ) : (
                      messages.map((m, i) => {
                        const isMe = m.senderId !== selectedFriend._id;
                        return (
                          <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm shadow-md ${isMe ? 'bg-[#37C6CB] text-black rounded-br-sm' : 'bg-gray-800 text-white rounded-bl-sm'}`}>
                              {m.content}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 px-1">
                              {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendMessage} className="flex gap-3 mt-auto bg-[#1a1a1a] p-2 rounded-full border border-[#333]">
                    <input 
                      type="text" 
                      className="flex-1 bg-transparent px-4 text-sm outline-none text-white placeholder-gray-500" 
                      placeholder="Message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-[#37C6CB] text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#2faeb3] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                      <MessageSquare size={16} className="ml-0.5 mt-0.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* Lists View */}
              {(viewMode === 'watchlist' || viewMode === 'ratings') && (
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-6">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4 border-b border-[#222] pb-2">
                      <ListVideo size={18} className="text-[#37C6CB]" />
                      <h3 className="text-lg font-bold text-white">Movies</h3>
                      <span className="bg-gray-800 text-xs text-gray-300 px-2 py-0.5 rounded-full ml-auto">{friendContent.movies.length}</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      {friendContent.movies.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">No movies found.</p> : 
                        friendContent.movies.map(m => (
                          <MovieCard key={m._id || m.id} movie={m} />
                        ))
                      }
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#222] w-full"></div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4 border-b border-[#222] pb-2">
                      <ListVideo size={18} className="text-[#37C6CB]" />
                      <h3 className="text-lg font-bold text-white">Webseries</h3>
                      <span className="bg-gray-800 text-xs text-gray-300 px-2 py-0.5 rounded-full ml-auto">{friendContent.webseries.length}</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      {friendContent.webseries.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">No webseries found.</p> : 
                        friendContent.webseries.map(w => (
                          <WebseriesCard key={w._id || w.id} webseries={w} />
                        ))
                      }
                    </div>
                  </div>

                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHub;
