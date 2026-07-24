import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Pin,
  PinOff,
  Bell,
  BellOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Timer,
  Users,
  Ban,
  Flag,
} from 'lucide-react';
import {
  CONVERSATION_DELETE_UNDO_WINDOW_MS,
  type ConversationDisappearingTtl,
  type ConversationMuteDuration,
  type IConversationSummary,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useToast } from '../../../shared/hooks/useToast';
import {
  usePinConversationMutation,
  useUnpinConversationMutation,
  useMuteConversationMutation,
  useUnmuteConversationMutation,
  useArchiveConversationMutation,
  useUnarchiveConversationMutation,
  useDeleteConversationMutation,
  useUndeleteConversationMutation,
  useSetDisappearingTtlMutation,
} from '../conversationApi';

interface ThreadOverflowMenuProps {
  conversation: IConversationSummary;
  canEditDisappearing: boolean;
  isCollapsed?: boolean;
  onOpenGroupInfo?: () => void;
  onOpenBlockConfirm?: () => void;
  onOpenReport?: () => void;
  onNavigateBack: () => void;
}

const COLLAPSIBLE_TRANSITION = { duration: 0.2 };

const MUTE_OPTIONS: { duration: ConversationMuteDuration; label: string }[] = [
  { duration: '8h', label: 'Mute for 8 hours' },
  { duration: '1d', label: 'Mute for 1 day' },
  { duration: '1w', label: 'Mute for 1 week' },
  { duration: 'forever', label: 'Mute forever' },
];

const TTL_OPTIONS: { ttl: ConversationDisappearingTtl; label: string }[] = [
  { ttl: 'off', label: 'Off' },
  { ttl: '24h', label: '24 hours' },
  { ttl: '7d', label: '7 days' },
];

const menuItemClasses =
  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary';

const ThreadOverflowMenu = ({
  conversation,
  canEditDisappearing,
  isCollapsed = false,
  onOpenGroupInfo,
  onOpenBlockConfirm,
  onOpenReport,
  onNavigateBack,
}: ThreadOverflowMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();

  const [pinConversation] = usePinConversationMutation();
  const [unpinConversation] = useUnpinConversationMutation();
  const [muteConversation] = useMuteConversationMutation();
  const [unmuteConversation] = useUnmuteConversationMutation();
  const [archiveConversation] = useArchiveConversationMutation();
  const [unarchiveConversation] = useUnarchiveConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const [undeleteConversation] = useUndeleteConversationMutation();
  const [setDisappearingTtl] = useSetDisappearingTtlMutation();

  const runAndClose = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleArchiveToggle = async () => {
    setIsOpen(false);
    if (conversation.isArchived) {
      await unarchiveConversation(conversation.id).unwrap();
    } else {
      await archiveConversation(conversation.id).unwrap();
      onNavigateBack();
    }
  };

  const handleDelete = () => {
    setIsOpen(false);
    deleteConversation(conversation.id);
    onNavigateBack();
    addToast(
      'Conversation deleted',
      'info',
      CONVERSATION_DELETE_UNDO_WINDOW_MS,
      { label: 'Undo', onClick: () => undeleteConversation(conversation.id) }
    );
  };

  const handleSelectTtl = (ttl: ConversationDisappearingTtl) => {
    setIsOpen(false);
    if (ttl === conversation.disappearingMessagesTtl) return;
    setDisappearingTtl({ conversationId: conversation.id, ttl });
  };

  return (
    <div className="relative shrink-0">
      <motion.div
        className="overflow-hidden md:!w-auto md:!opacity-100"
        animate={{
          width: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={COLLAPSIBLE_TRANSITION}
      >
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="More options"
          className="rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
        >
          <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </motion.div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg">
            {conversation.type === 'group' && onOpenGroupInfo && (
              <button
                type="button"
                className={menuItemClasses}
                onClick={() => runAndClose(onOpenGroupInfo)}
              >
                <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Group info
              </button>
            )}

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
                <PinOff className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              ) : (
                <Pin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              )}
              {conversation.isPinned ? 'Unpin' : 'Pin'}
            </button>

            {conversation.isMuted ? (
              <button
                type="button"
                className={menuItemClasses}
                onClick={() =>
                  runAndClose(() => unmuteConversation(conversation.id))
                }
              >
                <Bell className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
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
                      muteConversation({
                        conversationId: conversation.id,
                        duration: option.duration,
                      })
                    )
                  }
                >
                  <BellOff
                    className="h-3.5 w-3.5 shrink-0"
                    strokeWidth={1.75}
                  />
                  {option.label}
                </button>
              ))
            )}

            {canEditDisappearing && (
              <>
                <div className="my-1 border-t border-border" />
                <p className="px-3 pb-1 pt-1.5 text-xs font-medium text-text-muted">
                  <Timer className="mr-1.5 inline h-3 w-3" strokeWidth={1.75} />
                  Disappearing messages
                </p>
                {TTL_OPTIONS.map((option) => (
                  <button
                    key={option.ttl}
                    type="button"
                    onClick={() => handleSelectTtl(option.ttl)}
                    className={cn(
                      menuItemClasses,
                      'pl-8',
                      option.ttl === conversation.disappearingMessagesTtl
                        ? 'text-primary'
                        : undefined
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </>
            )}

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              className={menuItemClasses}
              onClick={handleArchiveToggle}
            >
              {conversation.isArchived ? (
                <ArchiveRestore
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                />
              ) : (
                <Archive className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              )}
              {conversation.isArchived ? 'Unarchive' : 'Archive'}
            </button>

            <button
              type="button"
              className={cn(menuItemClasses, 'text-error hover:text-error')}
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Delete conversation
            </button>

            {onOpenReport && (
              <button
                type="button"
                className={menuItemClasses}
                onClick={() => runAndClose(onOpenReport)}
              >
                <Flag className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Report
              </button>
            )}

            {onOpenBlockConfirm && (
              <button
                type="button"
                className={cn(menuItemClasses, 'text-error hover:text-error')}
                onClick={() => runAndClose(onOpenBlockConfirm)}
              >
                <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                Block
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadOverflowMenu;
