import { useCallback, useEffect, useRef } from 'react';
import {
  CONVERSATION_ROOM_JOIN_EVENT,
  CONVERSATION_ROOM_LEAVE_EVENT,
  MESSAGE_TYPING_SOCKET_EVENT,
  MESSAGE_TYPING_DEBOUNCE_MS,
} from '@network/shared';
import type { useSocket } from '../../../shared/hooks/useSocket';

export const useConversationRoom = (
  socketRef: ReturnType<typeof useSocket>,
  conversationId: string | null
) => {
  const lastTypingEmitAt = useRef(0);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    socket.emit(CONVERSATION_ROOM_JOIN_EVENT, { conversationId });

    return () => {
      socket.emit(CONVERSATION_ROOM_LEAVE_EVENT, { conversationId });
    };
  }, [socketRef, conversationId]);

  const emitTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    const now = Date.now();
    if (now - lastTypingEmitAt.current < MESSAGE_TYPING_DEBOUNCE_MS) return;
    lastTypingEmitAt.current = now;

    socket.emit(MESSAGE_TYPING_SOCKET_EVENT, { conversationId });
  }, [socketRef, conversationId]);

  return { emitTyping };
};
