import { useMemo, useRef, useState } from 'react';
import { BellOff, Pin } from 'lucide-react';
import type { IConversationSummary } from '@network/shared';
import { getRelativeDate } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { cn } from '../../../shared/utils/cn';
import { useGetMessagesQuery } from '../messageApi';
import { decodeMessagePayload } from '../messagePayload';
import {
  getConversationLabel,
  getConversationAvatarProps,
} from '../utils/conversationDisplay';
import ConversationContextMenu from './ConversationContextMenu';

const LONG_PRESS_DURATION_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

interface ConversationListItemProps {
  conversation: IConversationSummary;
  isActive: boolean;
  onSelect: (conversationId: string) => void;
}

const ConversationListItem = ({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) => {
  const { data } = useGetMessagesQuery({
    conversationId: conversation.id,
    limit: 1,
  });
  const latestMessage = data?.data[0];
  const preview = useMemo(() => {
    if (!latestMessage) return '';
    if (latestMessage.unsentAt) return 'This message was removed';
    return decodeMessagePayload(latestMessage.content).text;
  }, [latestMessage]);
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

  const avatarProps = getConversationAvatarProps(conversation);

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
        fallback={getConversationLabel(conversation)}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-text-primary">
          {conversation.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-text-muted" strokeWidth={1.75} />
          )}
          <span className="truncate">{getConversationLabel(conversation)}</span>
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
