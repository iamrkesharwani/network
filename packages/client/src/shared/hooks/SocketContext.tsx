import { createContext, useContext, useRef, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import type { useSocket } from './useSocket';

const SocketContext = createContext<ReturnType<typeof useSocket> | undefined>(
  undefined
);

export const SocketProvider = ({
  socketRef,
  children,
}: {
  socketRef: ReturnType<typeof useSocket>;
  children: ReactNode;
}) => (
  <SocketContext.Provider value={socketRef}>{children}</SocketContext.Provider>
);

export const useSocketContext = (): ReturnType<typeof useSocket> => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

// For components that render both inside PageWrapper (where a SocketProvider
// exists) and outside it (e.g. the dedicated /shorts/:shortId route, which
// sits outside PageWrapper the same way useMediaStatusSocket never reaches it
// either) - falls back to an always-empty ref rather than throwing, so those
// components degrade to "no live updates" instead of crashing.
export const useOptionalSocketContext = (): ReturnType<typeof useSocket> => {
  const context = useContext(SocketContext);
  const fallbackRef = useRef<Socket | null>(null);
  return context ?? fallbackRef;
};
