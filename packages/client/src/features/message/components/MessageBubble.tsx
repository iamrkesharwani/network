import { useEffect, useMemo, useState } from 'react';
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
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { axiosInstance } from '../../../shared/lib/axiosInstance';
import { decodeMessagePayload } from '../messagePayload';
import { linkifyText } from '../utils/linkifyText';
import { useDeleteMessageMutation, useGetMessageByIdQuery } from '../messageApi';
import SeenByIndicator from './SeenByIndicator';

interface MessageBubbleProps {
  message: IMessageResponse;
  myUserId: string;
  conversation: IConversationSummary;
  isLastFromSender: boolean;
  canEdit: boolean;
  repliedToMessage: IMessageResponse | undefined;
  onReply: (message: IMessageResponse) => void;
  onReact: (messageId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (messageId: string) => Promise<void>;
  onEdit: (messageId: string, text: string) => Promise<void>;
}

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
  message,
  myUserId,
  conversation,
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
  const [deleteMessage] = useDeleteMessageMutation();
  const isOwn = message.senderId === myUserId;
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

  const handleDeleteForMe = () => {
    deleteMessage({ messageId: message.id, scope: 'me' });
    setIsMenuOpen(false);
  };

  const handleUnsendForEveryone = () => {
    deleteMessage({ messageId: message.id, scope: 'everyone' });
    setIsMenuOpen(false);
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

  return (
    <div
      className={cn('group mb-2 flex', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div className="relative max-w-[75%]">
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
              'rounded-2xl px-3.5 py-2 text-sm',
              isRemoved
                ? 'bg-surface-raised italic text-text-muted'
                : isOwn
                  ? 'bg-primary text-white'
                  : 'bg-surface-raised text-text-primary'
            )}
          >
            {message.unsentAt
              ? 'This message was removed.'
              : message.expiredAt
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
                    ? 'border-white/20 bg-black/10'
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
              'absolute -top-2 hidden items-center gap-1 group-hover:flex',
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
                  onClick={handleDeleteForMe}
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
                    onClick={handleUnsendForEveryone}
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
      </div>

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
    </div>
  );
};

export default MessageBubble;
