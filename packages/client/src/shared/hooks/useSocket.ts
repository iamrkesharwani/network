import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { DEFAULT_API_URL } from '@network/shared';

export const useSocket = (token: string | null): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
    const socketUrl = new URL(apiUrl).origin;

    const instance = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    instance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
    };
  }, [token]);

  return socket;
};
