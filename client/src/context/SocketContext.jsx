import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineFriends] = useState([]); // Future expansion
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    let newSocket;

    const connectSocket = async () => {
      if (isSignedIn && isLoaded) {
        try {
          const token = await getToken();
          newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            auth: { token },
            withCredentials: true
          });

          newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
          });

          newSocket.on('connect_error', (err) => {
            console.error('Socket connect error:', err.message);
          });

          setSocket(newSocket);
        } catch (err) {
          console.error('Failed to get token for socket auth', err);
        }
      }
    };

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isSignedIn, isLoaded, getToken]);

  return (
    <SocketContext.Provider value={{ socket, onlineFriends }}>
      {children}
    </SocketContext.Provider>
  );
};
