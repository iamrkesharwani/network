import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import {
  MoreHorizontal,
  Trash2,
  Reply,
  Pencil,
  Smile,
  X,
  Clock,
  Link2,
  ImageOff,
  Flag,
} from 'lucide-react';
import ReportModal from '../../report/components/ReportModal';
import type { IConversationSummary, IMessageResponse } from '@network/shared';
import {
  getRelativeDate,
  formatDuration,
  MESSAGE_QUICK_REACTION_EMOJIS,
  DELETE_FOR_ME_UNDO_WINDOW_MS,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { axiosInstance } from '../../../shared/lib/axiosInstance';
import { useToast } from '../../../shared/hooks/useToast';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { decodeMessagePayload } from '../messagePayload';
import { linkifyText } from '../utils/linkifyText';
import {
  useDeleteMessageMutation,
  useUndeleteMessageMutation,
  useGetMessageByIdQuery,
} from '../messageApi';
import SeenByIndicator from './SeenByIndicator';

interface MessageBubbleProps {
  id?: string;
  message: IMessageResponse;
  myUserId: string;
  conversation: IConversationSummary;
  isFirstFromSender: boolean;
  isLastFromSender: boolean;
  canEdit: boolean;
  repliedToMessage: IMessageResponse | undefined;
  onReply: (message: IMessageResponse) => void;
  onReact: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: string) => Promise<void>;
  onEdit: (messageId: string, text: string) => Promise<void>;
}

const LONG_PRESS_DURATION_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;
const SWIPE_REPLY_THRESHOLD_PX = 56;

const formatCountdown = (expiresAt: string): string => {
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) return 'Disappearing soon';
  const hours = Math.round(remainingMs / (60 * 60 * 1000));
  if (hours < 1) return 'Disappears in <1h';
  if (hours < 24) return `Disappears in ${hours}h`;
  return `Disappears in ${Math.round(hours / 24)}d`;
};

const getParticipantName = (
  conversation: IConversationSummary,
  userId: string,
  myUserId: string
): string => {
  if (userId === myUserId) return 'You';
  const participants =
    conversation.type === 'direct'
      ? [conversation.otherParticipant]
      : conversation.participants;
  return participants.find((participant) => participant.id === userId)?.name ?? '';
};

const getParticipant = (
  conversation: IConversationSummary,
  userId: string
) => {
  const participants =
    conversation.type === 'direct'
      ? [conversation.otherParticipant]
      : conversation.participants;
  return participants.find((participant) => participant.id === userId);
};

interface ReplyPreviewProps {
  replyToMessageId: string;
  repliedToMessage: IMessageResponse | undefined;
  conversation: IConversationSummary;
  myUserId: string;
}

const ReplyPreview = ({
  replyToMessageId,
  repliedToMessage,
  conversation,
  myUserId,
}: ReplyPreviewProps) => {
  const { data, isFetching, isError } = useGetMessageByIdQuery(
    replyToMessageId,
    { skip: !!repliedToMessage }
  );
  const resolved = repliedToMessage ?? data?.data;
  const preview = useMemo(() => {
    if (!resolved || resolved.unsentAt || resolved.expiredAt) return null;
    return decodeMessagePayload(resolved.content).text;
  }, [resolved]);

  if (!resolved && (isFetching || isError)) {
    return (
      <div className="mb-1 rounded-lg border-l-2 border-border bg-black/5 px-2 py-1 text-xs italic text-text-muted">
        {isFetching ? 'Loading original message…' : 'Original message unavailable'}
      </div>
    );
  }

  if (!resolved) return null;

  return (
    <div className="mb-1 rounded-lg border-l-2 border-primary/60 bg-black/5 px-2 py-1 text-xs">
      <p className="font-medium text-text-primary">
        {getParticipantName(conversation, resolved.senderId, myUserId)}
      </p>
      <p className="truncate text-text-muted">
        {resolved.unsentAt
          ? 'This message was removed.'
          : resolved.expiredAt
            ? 'This message has expired.'
            : (preview ?? '…')}
      </p>
    </div>
  );
};

interface MessageAttachmentViewProps {
  message: IMessageResponse;
  isOwn: boolean;
}

const MessageAttachmentView = ({ message, isOwn }: MessageAttachmentViewProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    const load = async () => {
      try {
        const response = await axiosInstance.get(
          `/messages/${message.id}/attachment`,
          { responseType: 'blob' }
        );
        createdUrl = URL.createObjectURL(response.data as Blob);
        if (!cancelled) setObjectUrl(createdUrl);
      } catch {
        if (!cancelled) setHasError(true);
      }
    };
    load();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [message.id]);

  if (hasError) {
    return (
      <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-border bg-black/5 px-2 py-1.5 text-xs opacity-80">
        <ImageOff className="h-3.5 w-3.5" /> Couldn't load attachment
      </div>
    );
  }

  if (message.attachmentType === 'voice') {
    return (
      <div className="mt-2 flex items-center gap-2">
        {objectUrl ? (
          <audio controls src={objectUrl} className="h-10 max-w-full" />
        ) : (
          <span className="text-xs opacity-70">Loading voice note…</span>
        )}
        {message.attachmentDuration !== undefined && (
          <span className="text-xs opacity-70">
            {formatDuration(message.attachmentDuration)}
          </span>
        )}
      </div>
    );
  }

  return objectUrl ? (
    <a href={objectUrl} target="_blank" rel="noreferrer noopener">
      <img
        src={objectUrl}
        alt="Attachment"
        className="mt-2 max-h-72 max-w-full rounded-lg object-contain"
      />
    </a>
  ) : (
    <div
      className={cn(
        'mt-2 flex h-40 w-52 items-center justify-center rounded-lg text-xs opacity-70',
        isOwn ? 'bg-black/10' : 'bg-black/5'
      )}
    >
      Loading image…
    </div>
  );
};

const MessageBubble = ({
  id,
  message,
  myUserId,
  conversation,
  isFirstFromSender,
  isLastFromSender,
  canEdit,
  repliedToMessage,
  onReply,
  onReact,
  onRemoveReaction,
  onEdit,
}: MessageBubbleProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState('');
  const [pendingDeleteScope, setPendingDeleteScope] = useState<'me' | 'everyone' | null>(
    null
  );
  const [showActionsOnMobile, setShowActionsOnMobile] = useState(false);
  const [deleteMessage] = useDeleteMessageMutation();
  const [undeleteMessage] = useUndeleteMessageMutation();
  const { addToast } = useToast();
  const dragProgress = useMotionValue(0);
  const isMobile = useIsMobileLayout();
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isOwn = message.senderId === myUserId;
  const isUnsent = Boolean(message.unsentAt);
  const isRemoved = Boolean(
    message.unsentAt || message.expiredAt || message.moderationRemovedAt
  );

  const { text, linkPreview } = useMemo(() => {
    if (isRemoved) return { text: null, linkPreview: null };
    const payload = decodeMessagePayload(message.content);
    return { text: payload.text, linkPreview: payload.linkPreview ?? null };
  }, [message.content, isRemoved]);

  const reactionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const reaction of message.reactions) {
      const users = groups.get(reaction.content) ?? [];
      users.push(reaction.userId);
      groups.set(reaction.content, users);
    }
    return Array.from(groups.entries());
  }, [message.reactions]);

  const myReactionEmoji = message.reactions.find(
    (reaction) => reaction.userId === myUserId
  )?.content;

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch || isRemoved || isEditing) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      setIsMenuOpen(true);
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

  const handleBubbleClick = (event: React.MouseEvent) => {
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    if (!isMobile || isRemoved || isEditing) return;
    if ((event.target as HTMLElement).closest('button, a')) return;
    setShowActionsOnMobile((prev) => !prev);
  };

  const handleSwipeDrag = (_event: unknown, info: { offset: { x: number } }) => {
    dragProgress.set(Math.min(Math.max(info.offset.x / SWIPE_REPLY_THRESHOLD_PX, 0), 1));
  };

  const handleSwipeDragEnd = (_event: unknown, info: { offset: { x: number } }) => {
    dragProgress.set(0);
    if (info.offset.x >= SWIPE_REPLY_THRESHOLD_PX * 0.7) onReply(message);
  };

  const handleDeleteForMeClick = () => {
    setIsMenuOpen(false);
    setPendingDeleteScope('me');
  };

  const handleUnsendForEveryoneClick = () => {
    setIsMenuOpen(false);
    setPendingDeleteScope('everyone');
  };

  const confirmDeleteForMe = () => {
    setPendingDeleteScope(null);
    deleteMessage({ messageId: message.id, scope: 'me' });
    addToast(
      'Message deleted',
      'info',
      DELETE_FOR_ME_UNDO_WINDOW_MS,
      { label: 'Undo', onClick: () => undeleteMessage(message.id) }
    );
  };

  const confirmUnsendForEveryone = () => {
    setPendingDeleteScope(null);
    deleteMessage({ messageId: message.id, scope: 'everyone' });
  };

  const handlePickEmoji = async (emoji: string) => {
    setIsReactionPickerOpen(false);
    if (myReactionEmoji === emoji) {
      await onRemoveReaction(message.id);
      return;
    }
    await onReact(message.id, emoji);
  };

  const handleStartEdit = () => {
    setEditDraft(text ?? '');
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editDraft.trim();
    if (trimmed && trimmed !== text) {
      await onEdit(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const groupRoundedClass = isOwn
    ? cn(
        'rounded-2xl',
        !isFirstFromSender && 'rounded-tr-md',
        !isLastFromSender && 'rounded-br-md'
      )
    : cn(
        'rounded-2xl',
        !isFirstFromSender && 'rounded-tl-md',
        !isLastFromSender && 'rounded-bl-md'
      );

  return (
    <div
      id={id}
      className={cn('group flex scroll-mt-3', isOwn ? 'justify-end' : 'justify-start')}
    >
      <AnimatePresence initial={false}>
        {!isUnsent && (
          <motion.div
            key="bubble"
            className={cn('relative max-w-[75%]', isLastFromSender ? 'mb-2' : 'mb-0.5')}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              marginBottom: 0,
              overflow: 'hidden',
            }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            drag={!isRemoved && !isEditing && isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: SWIPE_REPLY_THRESHOLD_PX }}
            dragElastic={0.15}
            dragSnapToOrigin
            onDrag={handleSwipeDrag}
            onDragEnd={handleSwipeDragEnd}
            onClick={handleBubbleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              className="pointer-events-none absolute top-1/2 -left-8 -translate-y-1/2 text-icon"
              style={{ opacity: dragProgress }}
            >
              <Reply className="h-4 w-4" strokeWidth={1.75} />
            </motion.div>

            {message.replyToMessageId && (
              <ReplyPreview
                replyToMessageId={message.replyToMessageId}
                repliedToMessage={repliedToMessage}
                conversation={conversation}
                myUserId={myUserId}
              />
            )}
    
            {isEditing ? (
              <div className="rounded-2xl bg-surface-raised px-3.5 py-2">
                <textarea
                  value={editDraft}
                  onChange={(event) => setEditDraft(event.target.value)}
                  className="w-full resize-none bg-transparent text-sm text-text-primary outline-none"
                  rows={2}
                  autoFocus
                />
                <div className="mt-1 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  groupRoundedClass,
                  'px-3.5 py-2 text-sm',
                  isRemoved
                    ? 'bg-surface-raised italic text-text-muted'
                    : isOwn
                      ? 'border border-primary/40 bg-primary-subtle text-text-primary'
                      : 'bg-surface-raised text-text-primary'
                )}
              >
                {message.expiredAt
                  ? 'This message has expired.'
                  : message.moderationRemovedAt
                    ? 'This message was removed for violating community guidelines.'
                    : text !== null
                      ? linkifyText(text)
                      : '...'}
    
                {!isRemoved && message.attachmentType && (
                  <MessageAttachmentView message={message} isOwn={isOwn} />
                )}
    
                {linkPreview && (
                  <a
                    href={linkPreview.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={cn(
                      'mt-2 flex gap-2 rounded-lg border p-2 text-xs',
                      isOwn
                        ? 'border-primary/20 bg-surface'
                        : 'border-border bg-surface'
                    )}
                  >
                    {linkPreview.thumbnailUrl ? (
                      <img
                        src={linkPreview.thumbnailUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <Link2 className="h-4 w-4 shrink-0 opacity-70" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {linkPreview.title}
                      </span>
                      <span className="block truncate opacity-70">
                        {linkPreview.authorName ?? linkPreview.provider}
                      </span>
                    </span>
                  </a>
                )}
              </div>
            )}
    
            {reactionGroups.length > 0 && (
              <div
                className={cn(
                  'mt-1 flex flex-wrap gap-1',
                  isOwn ? 'justify-end' : 'justify-start'
                )}
              >
                {reactionGroups.map(([emoji, users]) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePickEmoji(emoji)}
                    className={cn(
                      'rounded-full border px-1.5 py-0.5 text-xs',
                      users.includes(myUserId)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    )}
                  >
                    {emoji} {users.length}
                  </button>
                ))}
              </div>
            )}
    
            <span
              className={cn(
                'mt-1 flex items-center gap-1 text-[0.65rem] text-text-muted',
                isOwn ? 'justify-end' : 'justify-start'
              )}
            >
              {message.editedAt && !isRemoved && <span>(edited)</span>}
              {getRelativeDate(message.createdAt)}
              {message.expiresAt && !isRemoved && (
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" /> {formatCountdown(message.expiresAt)}
                </span>
              )}
            </span>
    
            {!isRemoved && !isEditing && (
              <div
                className={cn(
                  'absolute -top-2 items-center gap-1',
                  showActionsOnMobile ? 'flex' : 'hidden group-hover:flex',
                  isOwn ? 'right-0' : 'left-0'
                )}
              >
                <button
                  type="button"
                  onClick={() => setIsReactionPickerOpen((open) => !open)}
                  className="rounded-full bg-surface p-1 text-text-muted hover:text-text-primary"
                  aria-label="React"
                >
                  <Smile className="h-3.5 w-3.5" />
                </button>
    
                <button
                  type="button"
                  onClick={() => onReply(message)}
                  className="rounded-full bg-surface p-1 text-text-muted hover:text-text-primary"
                  aria-label="Reply"
                >
                  <Reply className="h-3.5 w-3.5" />
                </button>
    
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="rounded-full bg-surface p-1 text-text-muted hover:text-text-primary"
                  aria-label="Message options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
    
                {isReactionPickerOpen && (
                  <div
                    className={cn(
                      'absolute top-6 z-10 flex gap-1 rounded-full border border-border bg-surface px-2 py-1 shadow-lg',
                      isOwn ? 'right-0' : 'left-0'
                    )}
                  >
                    {MESSAGE_QUICK_REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handlePickEmoji(emoji)}
                        className="text-base hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsReactionPickerOpen(false)}
                      className="text-text-muted hover:text-text-primary"
                      aria-label="Close reaction picker"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
    
                {isMenuOpen && (
                  <div
                    className={cn(
                      'absolute z-10 mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg',
                      isOwn ? 'right-0' : 'left-0'
                    )}
                  >
                    <button
                      type="button"
                      onClick={handleDeleteForMeClick}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-primary hover:bg-surface-raised"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete for me
                    </button>
                    {isOwn && canEdit && (
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-primary hover:bg-surface-raised"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    )}
                    {isOwn && (
                      <button
                        type="button"
                        onClick={handleUnsendForEveryoneClick}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-error hover:bg-surface-raised"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Unsend for everyone
                      </button>
                    )}
                    {!isOwn && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsReportOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-error hover:bg-surface-raised"
                      >
                        <Flag className="h-3.5 w-3.5" /> Report message
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
    
            {isOwn && isLastFromSender && !isRemoved && (
              <SeenByIndicator
                message={message}
                conversation={conversation}
                viewerId={myUserId}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOwn && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          contentType="message"
          contentId={message.id}
          authorId={message.senderId}
          initialDisclosedContent={text ?? ''}
          blockTarget={(() => {
            const sender = getParticipant(conversation, message.senderId);
            return sender
              ? { username: sender.username, name: sender.name }
              : undefined;
          })()}
        />
      )}

      <ConfirmModal
        isOpen={pendingDeleteScope !== null}
        onClose={() => setPendingDeleteScope(null)}
        onConfirm={
          pendingDeleteScope === 'everyone' ? confirmUnsendForEveryone : confirmDeleteForMe
        }
        title={
          pendingDeleteScope === 'everyone'
            ? 'Unsend this message for everyone?'
            : 'Delete this message for you?'
        }
        description={
          pendingDeleteScope === 'everyone'
            ? "This removes it for everyone in the conversation and can't be undone."
            : "It'll disappear from your view only. You'll have a few seconds to undo right after."
        }
        confirmLabel={pendingDeleteScope === 'everyone' ? 'Unsend' : 'Delete'}
        intent="danger"
      />
    </div>
  );
};

export default MessageBubble;
