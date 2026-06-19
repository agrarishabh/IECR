import { Server } from 'socket.io';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import { logger } from './lib/logger.js';

let io;
const onlineUsers = new Map(); // Map<userId, socketId>

export const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  io.on('connection', (socket) => {
    socket.on('join', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      logger.info(`[SOCKET] User ${socket.userId} connected (id: ${socket.id})`);
      
      // Emit unread notification count on join
      try {
        const unreadCount = await Notification.countDocuments({ userId, read: false });
        socket.emit('unread_notifications_count', unreadCount);
      } catch (err) { logger.error(err); }
    });

    socket.on('send_message', async ({ receiverId, content }) => {
      try {
        const msg = await Message.create({ senderId: socket.userId, receiverId, content });
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', msg);
        }
        socket.emit('receive_message', msg); // Echo back
      } catch (err) { logger.error('[SOCKET ERROR]', err); }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        logger.info(`[SOCKET] User ${socket.userId} disconnected`);
      }
    });
  });
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const getOnlineUsers = () => onlineUsers;

export const getSocketId = (userId) => {
  return onlineUsers.get(userId);
};
