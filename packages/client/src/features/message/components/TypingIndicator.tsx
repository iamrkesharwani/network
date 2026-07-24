import { useEffect, useState } from 'react';
import {
  MESSAGE_TYPING_SOCKET_EVENT,
  MESSAGE_TYPING_AUTO_CLEAR_MS,
} from '@network/shared';
import type { useSocket } from '../../../shared/hooks/useSocket';

interface TypingPayload {
  userId: string;
  conversationId: string;
}

interface TypingIndicatorProps {
  socket: ReturnType<typeof useSocket>;
  conversationId: string;
  participantNameById: Record<string, string>;
  myUserId: string;
}

const TypingIndicator = ({
  socket,
  conversationId,
  participantNameById,
  myUserId,
}: TypingIndicatorProps) => {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  useEffect(() => {
    setTypingUserIds([]);
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;

    const timers = new Map<string, ReturnType<typeof setTimeout>>();

    const handleTyping = (payload: TypingPayload) => {
      if (payload.conversationId !== conversationId || payload.userId === myUserId) {
        return;
      }

      setTypingUserIds((prev) =>
        prev.includes(payload.userId) ? prev : [...prev, payload.userId]
      );

      const existingTimer = timers.get(payload.userId);
      if (existingTimer) clearTimeout(existingTimer);

      timers.set(
        payload.userId,
        setTimeout(() => {
          setTypingUserIds((prev) => prev.filter((id) => id !== payload.userId));
          timers.delete(payload.userId);
        }, MESSAGE_TYPING_AUTO_CLEAR_MS)
      );
    };

    socket.on(MESSAGE_TYPING_SOCKET_EVENT, handleTyping);

    return () => {
      socket.off(MESSAGE_TYPING_SOCKET_EVENT, handleTyping);
      timers.forEach(clearTimeout);
    };
  }, [socket, conversationId, myUserId]);

  if (typingUserIds.length === 0) return null;

  const names = typingUserIds.map((id) => participantNameById[id] ?? 'Someone');

  return (
    <p className="px-1 text-xs italic text-text-muted">
      {names.join(', ')} {names.length > 1 ? 'are' : 'is'} typing…
    </p>
  );
};

export default TypingIndicator;
