import { createContext, useContext, type ReactNode } from 'react';
import type { useSocket } from './useSocket';

const SOCKET_CONTEXT_UNSET = Symbol('socket-context-unset');

const SocketContext = createContext<
  ReturnType<typeof useSocket> | typeof SOCKET_CONTEXT_UNSET
>(SOCKET_CONTEXT_UNSET);

export const SocketProvider = ({
  socket,
  children,
}: {
  socket: ReturnType<typeof useSocket>;
  children: ReactNode;
}) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);

export const useSocketContext = (): ReturnType<typeof useSocket> => {
  const context = useContext(SocketContext);
  if (context === SOCKET_CONTEXT_UNSET) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
