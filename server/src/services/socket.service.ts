// server/src/services/socket.service.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';
import config from '../config';

let io: Server;

export const initializeSocketIO = (server: HttpServer): void => {
  io = new Server(server, {
    cors: config.corsOptions,
    pingTimeout: 60000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join a room for private communication
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      logger.debug(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // Leave a room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      logger.debug(`Socket ${socket.id} left room: ${roomId}`);
    });

    // Handle video call signaling
    socket.on(
      'call-user',
      (data: { userToCall: string; signalData: any; from: string; name: string }) => {
        io.to(data.userToCall).emit('call-user', {
          signal: data.signalData,
          from: data.from,
          name: data.name,
        });
      }
    );

    socket.on('answer-call', (data: { to: string; signal: any }) => {
      io.to(data.to).emit('call-accepted', data.signal);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
