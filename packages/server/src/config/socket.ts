import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { jwtVerify } from 'jose';
import type { Server } from 'node:http';
import { pubClient, subClient } from './redis.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

interface SocketUser {
  id: string;
  role: string;
}

declare module 'socket.io' {
  interface SocketData {
    user: SocketUser;
  }
}

let io: SocketIOServer | null = null;

const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token: string | undefined =
      socket.handshake.auth['token'] ??
      socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      return next(new Error('Authentication error: Invalid token payload'));
    }

    socket.data.user = {
      id: payload.sub,
      role: typeof payload['role'] === 'string' ? payload['role'] : 'user',
    };

    next();
  } catch (error) {
    logger.error(error, 'Socket authentication failed');
    next(new Error('Authentication error: Invalid or expired token'));
  }
};

const handleConnection = (socket: Socket): void => {
  const { id: userId, role } = socket.data.user;

  logger.info(
    { userId, role, socketId: socket.id },
    'User connected via socket'
  );

  socket.join(`user:${userId}`);

  socket.on('disconnect', (reason) => {
    logger.info({ userId, socketId: socket.id, reason }, 'User disconnected');
  });
};

export const initSocket = (httpServer: Server): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  try {
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io Redis adapter attached');
  } catch (error) {
    logger.error(error, 'Failed to attach Redis adapter');
    throw error;
  }

  io.use(socketAuthMiddleware);
  io.on('connection', handleConnection);

  logger.info('Socket.io initialized');

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error(
      'Socket.io has not been initialized. Call initSocket first.'
    );
  }
  return io;
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown
): void => {
  try {
    getIO().to(`user:${userId}`).emit(event, payload);
  } catch (error) {
    logger.warn(error, `Failed to emit "${event}" to user:${userId}`);
  }
};
