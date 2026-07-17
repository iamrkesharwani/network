import { useEffect } from 'react';
import { CREATOR_EVENT_SOCKET_EVENT, type ICreatorEvent } from '@network/shared';
import type { useSocket } from '../../../shared/hooks/useSocket';
import { useCreatorCelebration } from './useCreatorCelebration';

export const useCreatorEventSocket = (
  socketRef: ReturnType<typeof useSocket>
) => {
  const { current, celebrate, dismiss } = useCreatorCelebration();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleCreatorEvent = (event: ICreatorEvent) => celebrate(event);

    socket.on(CREATOR_EVENT_SOCKET_EVENT, handleCreatorEvent);

    return () => {
      socket.off(CREATOR_EVENT_SOCKET_EVENT, handleCreatorEvent);
    };
  }, [socketRef, celebrate]);

  return { current, dismiss };
};
