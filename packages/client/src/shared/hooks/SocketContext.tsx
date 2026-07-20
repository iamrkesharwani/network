import { createContext, useContext, type ReactNode } from 'react';
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
