import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

export const useSocket = (token: string | null) => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const socketUrl = new URL(apiUrl).origin;

    socket.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [token]);

  return socket.current;
};
