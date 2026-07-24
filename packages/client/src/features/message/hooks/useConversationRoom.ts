import { useCallback, useEffect, useRef } from 'react';
import {
  CONVERSATION_ROOM_JOIN_EVENT,
  CONVERSATION_ROOM_LEAVE_EVENT,
  MESSAGE_TYPING_SOCKET_EVENT,
  MESSAGE_TYPING_DEBOUNCE_MS,
} from '@network/shared';
import type { useSocket } from '../../../shared/hooks/useSocket';

export const useConversationRoom = (
  socket: ReturnType<typeof useSocket>,
  conversationId: string | null
) => {
  const lastTypingEmitAt = useRef(0);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit(CONVERSATION_ROOM_JOIN_EVENT, { conversationId });

    return () => {
      socket.emit(CONVERSATION_ROOM_LEAVE_EVENT, { conversationId });
    };
  }, [socket, conversationId]);

  const emitTyping = useCallback(() => {
    if (!socket || !conversationId) return;

    const now = Date.now();
    if (now - lastTypingEmitAt.current < MESSAGE_TYPING_DEBOUNCE_MS) return;
    lastTypingEmitAt.current = now;

    socket.emit(MESSAGE_TYPING_SOCKET_EVENT, { conversationId });
  }, [socket, conversationId]);

  return { emitTyping };
};
