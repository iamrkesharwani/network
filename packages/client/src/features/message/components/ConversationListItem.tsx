import { useEffect, useRef, useState } from 'react';
import { BellOff, Pin } from 'lucide-react';
import type { IConversationSummary } from '@network/shared';
import { getRelativeDate } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { cn } from '../../../shared/utils/cn';
import { useGetMessagesQuery } from '../messageApi';
import { decryptMessage } from '../keyManager';
import { decodeMessagePayload } from '../messagePayload';
import ConversationContextMenu from './ConversationContextMenu';

const LONG_PRESS_DURATION_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

interface ConversationListItemProps {
  conversation: IConversationSummary;
  isActive: boolean;
  privateKey: CryptoKey;
  myUserId: string;
  onSelect: (conversationId: string) => void;
}

const getLabel = (conversation: IConversationSummary): string =>
  conversation.type === 'direct'
    ? conversation.otherParticipant.name
    : conversation.groupName;

const getAvatarProps = (conversation: IConversationSummary) =>
  conversation.type === 'direct'
    ? {
        src: conversation.otherParticipant.avatarUrl,
        isOnline: conversation.otherParticipant.isOnline,
      }
    : { src: conversation.groupAvatarUrl, isOnline: undefined };

const ConversationListItem = ({
  conversation,
  isActive,
  privateKey,
  myUserId,
  onSelect,
}: ConversationListItemProps) => {
  const { data } = useGetMessagesQuery({
    conversationId: conversation.id,
    limit: 1,
  });
  const latestMessage = data?.data[0];
  const [preview, setPreview] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const openMenuAt = (clientX: number, clientY: number) => {
    setMenuPosition({ top: clientY, left: clientX });
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    openMenuAt(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      openMenuAt(touch.clientX, touch.clientY);
    }, LONG_PRESS_DURATION_MS);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    const start = touchStartRef.current;
    if (!touch || !start) return;
    const distance = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
    if (distance > LONG_PRESS_MOVE_TOLERANCE_PX) clearLongPressTimer();
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
  };

  const handleClick = () => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onSelect(conversation.id);
  };

  useEffect(() => {
    if (!latestMessage) {
      setPreview('');
      return;
    }
    if (latestMessage.unsentAt) {
      setPreview('This message was removed');
      return;
    }

    let cancelled = false;
    decryptMessage(latestMessage, privateKey, myUserId)
      .then((decrypted) => {
        if (!cancelled) setPreview(decodeMessagePayload(decrypted).text);
      })
      .catch(() => {
        if (!cancelled) setPreview('Unable to decrypt message');
      });

    return () => {
      cancelled = true;
    };
  }, [latestMessage, privateKey, myUserId]);

  const avatarProps = getAvatarProps(conversation);

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-raised',
        isActive && 'bg-surface-raised'
      )}
    >
      <Avatar
        src={avatarProps.src}
        isOnline={avatarProps.isOnline}
        fallback={getLabel(conversation)}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-text-primary">
          {conversation.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-text-muted" strokeWidth={1.75} />
          )}
          <span className="truncate">{getLabel(conversation)}</span>
        </p>
        <p className="truncate text-xs text-text-muted">
          {preview || ' '}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-1 text-[0.65rem] text-text-muted">
          {conversation.isMuted && (
            <BellOff className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          )}
          {getRelativeDate(conversation.lastMessageAt)}
        </span>
        {conversation.isUnread && (
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              conversation.isMuted ? 'bg-text-muted' : 'bg-primary'
            )}
          />
        )}
      </div>
      {menuPosition && (
        <ConversationContextMenu
          conversation={conversation}
          position={menuPosition}
          onClose={() => setMenuPosition(null)}
        />
      )}
    </button>
  );
};

export default ConversationListItem;
