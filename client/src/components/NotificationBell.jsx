import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import api from '../lib/api';
const NotificationBell = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/api/notifications');
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    if (socket) {
      socket.on('new_notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
      });
    }

    return () => {
      if (socket) socket.off('new_notification');
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif._id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={bellRef}>
      <button 
        className="relative p-2 text-gray-300 hover:text-white transition cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs text-[#37C6CB] hover:underline"
                onClick={async () => {
                  await api.put('/api/notifications/read-all');
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="p-2">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-3 rounded-md mb-1 cursor-pointer transition ${n.read ? 'bg-transparent hover:bg-gray-800' : 'bg-gray-800/80 hover:bg-gray-800'}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
