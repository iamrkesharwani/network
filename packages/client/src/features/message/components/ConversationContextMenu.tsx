import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pin, PinOff, Bell, BellOff, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import {
  CONVERSATION_DELETE_UNDO_WINDOW_MS,
  type IConversationSummary,
  type ConversationMuteDuration,
} from '@network/shared';
import { useToast } from '../../../shared/hooks/useToast';
import { cn } from '../../../shared/utils/cn';
import {
  usePinConversationMutation,
  useUnpinConversationMutation,
  useMuteConversationMutation,
  useUnmuteConversationMutation,
  useArchiveConversationMutation,
  useUnarchiveConversationMutation,
  useDeleteConversationMutation,
  useUndeleteConversationMutation,
} from '../conversationApi';

interface ConversationContextMenuProps {
  conversation: IConversationSummary;
  position: { top: number; left: number };
  onClose: () => void;
}

const MUTE_OPTIONS: { duration: ConversationMuteDuration; label: string }[] = [
  { duration: '8h', label: 'Mute for 8 hours' },
  { duration: '1d', label: 'Mute for 1 day' },
  { duration: '1w', label: 'Mute for 1 week' },
  { duration: 'forever', label: 'Mute forever' },
];

const menuItemClasses =
  'flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors';

const VIEWPORT_EDGE_MARGIN_PX = 8;

const ConversationContextMenu = ({
  conversation,
  position,
  onClose,
}: ConversationContextMenuProps) => {
  const { addToast } = useToast();
  const [pinConversation] = usePinConversationMutation();
  const [unpinConversation] = useUnpinConversationMutation();
  const [muteConversation] = useMuteConversationMutation();
  const [unmuteConversation] = useUnmuteConversationMutation();
  const [archiveConversation] = useArchiveConversationMutation();
  const [unarchiveConversation] = useUnarchiveConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const [undeleteConversation] = useUndeleteConversationMutation();

  const menuRef = useRef<HTMLDivElement>(null);
  const [clampedPosition, setClampedPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    const maxTop = window.innerHeight - rect.height - VIEWPORT_EDGE_MARGIN_PX;
    const maxLeft = window.innerWidth - rect.width - VIEWPORT_EDGE_MARGIN_PX;

    setClampedPosition({
      top: Math.max(VIEWPORT_EDGE_MARGIN_PX, Math.min(position.top, maxTop)),
      left: Math.max(VIEWPORT_EDGE_MARGIN_PX, Math.min(position.left, maxLeft)),
    });
  }, [position]);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [onClose]);

  const runAndClose = (action: () => void) => {
    action();
    onClose();
  };

  const handleDelete = () => {
    onClose();
    deleteConversation(conversation.id);
    addToast(
      'Conversation deleted',
      'info',
      CONVERSATION_DELETE_UNDO_WINDOW_MS,
      { label: 'Undo', onClick: () => undeleteConversation(conversation.id) }
    );
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: (clampedPosition ?? position).top,
          left: (clampedPosition ?? position).left,
          visibility: clampedPosition ? 'visible' : 'hidden',
        }}
        className="z-50 w-52 py-1 rounded-xl bg-surface-overlay border border-border shadow-xl shadow-black/40"
      >
        <button
          type="button"
          className={menuItemClasses}
          onClick={() =>
            runAndClose(() =>
              conversation.isPinned
                ? unpinConversation(conversation.id)
                : pinConversation(conversation.id)
            )
          }
        >
          {conversation.isPinned ? (
            <PinOff className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          ) : (
            <Pin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          )}
          {conversation.isPinned ? 'Unpin' : 'Pin'}
        </button>

        {conversation.isMuted ? (
          <button
            type="button"
            className={menuItemClasses}
            onClick={() => runAndClose(() => unmuteConversation(conversation.id))}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            Unmute
          </button>
        ) : (
          MUTE_OPTIONS.map((option) => (
            <button
              key={option.duration}
              type="button"
              className={menuItemClasses}
              onClick={() =>
                runAndClose(() =>
                  muteConversation({ conversationId: conversation.id, duration: option.duration })
                )
              }
            >
              <BellOff className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              {option.label}
            </button>
          ))
        )}

        <button
          type="button"
          className={menuItemClasses}
          onClick={() =>
            runAndClose(() =>
              conversation.isArchived
                ? unarchiveConversation(conversation.id)
                : archiveConversation(conversation.id)
            )
          }
        >
          {conversation.isArchived ? (
            <ArchiveRestore className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          ) : (
            <Archive className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          )}
          {conversation.isArchived ? 'Unarchive' : 'Archive'}
        </button>

        <button
          type="button"
          className={cn(menuItemClasses, 'text-error hover:text-error')}
          onClick={handleDelete}
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          Delete
        </button>
      </div>
    </>,
    document.body
  );
};

export default ConversationContextMenu;
