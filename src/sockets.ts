import { Socket } from 'socket.io'
import SocketService from './services/socketService'
import { logger } from './common/utils/logger'
import jwt from 'jsonwebtoken';
import { config } from './services/configService';
import { MessageService } from './modules/message/messageService';
import { ChatService } from './modules/chat/chatService';

const socketIO = SocketService.getIO()

type EventHandler<T = any> = (data: T, callback?: (response: any) => void) => void

// JWT Token validation for sockets
const validateSocketToken = (token: string): { id: string; email: string } | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string };
    return decoded;
  } catch (error) {
    logger.error('Socket token validation failed:', error);
    return null;
  }
};

const handleSocketEvent = (socket: Socket, eventName: string, handler: EventHandler) => {
  socket.on(eventName, (data, callback) => {
    logger.info(`📡 Event: ${eventName} | Data:`, data);

    let parsedData: any = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (err) {
        logger.error('❌ Failed to parse event data:', data);
        return callback?.({ success: false, message: 'Invalid JSON' });
      }
    }

    handler(parsedData, callback);
  });
};

const registerSocketEvents = (socket: Socket) => {
  const messageService = new MessageService();
  const chatService = new ChatService();

  // AUTHENTICATE - Users must provide JWT token to join socket app
  handleSocketEvent(socket, 'authenticate', async (data, callback) => {

    if (!data.token) {
      const response = { success: false, statusCode: 401, message: 'JWT token required for authentication' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      socket.disconnect(true);
      return;
    }

    // Validate JWT token
    const decoded = validateSocketToken(data.token);
    if (!decoded) {
      const response = { success: false, statusCode: 401, message: 'Invalid or expired token' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      socket.disconnect(true);
      return;
    }

    // Store authenticated user data in socket
    socket.data.userId = decoded.id;
    socket.data.userEmail = decoded.email;
    socket.data.isAuthenticated = true;

    // Leave all rooms except socket.id
    [...socket.rooms].forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join user room for notifications
    socket.join(`user_${decoded.id}`);

    // Mark user as online
    socket.broadcast.emit('userOnline', { 
      userId: decoded.id,
      status: 'online'
    });

    logger.info(`User authenticated via socket: ${decoded.id} (${decoded.email})`);

    const response = {
      success: true,
      statusCode: 200,
      message: 'Authentication successful',
      user: { id: decoded.id, email: decoded.email }
    };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
  });

  //  User joins a specific chat room (requires authentication)
  handleSocketEvent(socket, 'joinChat', async (data, callback) => {
    // Check if user is authenticated
    if (!socket.data.isAuthenticated || !socket.data.userId) {
      const response = { success: false, statusCode: 401, message: 'Must authenticate first using JWT token' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      return;
    }

    if (!data.chatId) {
      const response = { success: false, statusCode: 400, message: 'chatId missing' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      return;
    }

    const userId = socket.data.userId;

    try {
      // Verify user is participant in the chat
      const chat = await chatService.getChatById({ id: data.chatId, userId });
      if (!chat) {
        const response = { success: false, statusCode: 403, message: 'Access denied - not a participant in this chat' };
        if (callback && typeof callback === 'function') {
          callback(response);
        }
        return;
      }

      // Leave all chat rooms (but keep user room)
      [...socket.rooms].forEach(room => {
        if (room !== socket.id && !room.startsWith('user_')) {
          socket.leave(room);
        }
      });

      // Join the chat room
      socket.join(`chat_${data.chatId}`);

      logger.info(`🔒 User ${userId} joined secure chat room: ${data.chatId}`);

      const response = { success: true, statusCode: 200, message: 'Joined chat room securely' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    } catch (error) {
      logger.error('Error joining chat:', error);
      const response = { success: false, statusCode: 500, message: 'Failed to join chat' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    }
  });

  //  Mark message as read (requires authentication)
  handleSocketEvent(socket, 'markAsRead', async (data, callback) => {
    // Check if user is authenticated
    if (!socket.data.isAuthenticated || !socket.data.userId) {
      const response = { success: false, statusCode: 401, message: 'Must authenticate first using JWT token' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      return;
    }

    const userId = socket.data.userId;
    if (!data.messageId) {
      const response = { success: false, statusCode: 400, message: 'messageId missing' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      return;
    }

    try {
      await messageService.markMessageAsRead(data.messageId, userId);
      const response = { success: true, statusCode: 200, message: 'Message marked as read' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    } catch (error) {
      logger.error('Error marking message as read:', error);
      const response = { success: false, statusCode: 500, message: 'Failed to mark as read' };
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      // Notify other users that this user went offline
      socket.broadcast.emit('userOffline', { 
        userId,
        status: 'offline'
      });
      logger.info(`🔐 Authenticated user ${userId} disconnected`);
    } else {
      logger.info('🚫 Unauthenticated user disconnected');
    }
  });

  handleSocketEvent(socket, 'send_notification', (data, callback) => {
    socketIO.emit('receive_notification', data)
    callback?.({ status: 'success', message: 'Notification sent' })
  })
}

export default registerSocketEvents
