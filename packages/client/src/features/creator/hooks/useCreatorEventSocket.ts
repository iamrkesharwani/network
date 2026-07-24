import { useEffect } from 'react';
import { useCreatorCelebration } from './useCreatorCelebration';
import type { useSocket } from '../../../shared/hooks/useSocket';
import {
  CREATOR_EVENT_SOCKET_EVENT,
  type ICreatorEvent,
} from '@network/shared';

export const useCreatorEventSocket = (
  socket: ReturnType<typeof useSocket>
) => {
  const { current, celebrate, dismiss } = useCreatorCelebration();

  useEffect(() => {
    if (!socket) return;

    const handleCreatorEvent = (event: ICreatorEvent) => celebrate(event);

    socket.on(CREATOR_EVENT_SOCKET_EVENT, handleCreatorEvent);

    return () => {
      socket.off(CREATOR_EVENT_SOCKET_EVENT, handleCreatorEvent);
    };
  }, [socket, celebrate]);

  return { current, dismiss };
};
