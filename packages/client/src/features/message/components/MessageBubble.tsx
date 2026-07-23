import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Trash2, Reply, Pencil, Smile, X, Clock, Link2 } from 'lucide-react';
import type {
  IConversationSummary,
  IMessageLinkPreview,
  IMessageResponse,
} from '@network/shared';
import { getRelativeDate, MESSAGE_QUICK_REACTION_EMOJIS } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { decryptMessage } from '../keyManager';
import { decodeMessagePayload } from '../messagePayload';
import {
  useDeleteMessageMutation,
  useGetMessageByIdQuery,
} from '../messageApi';
import SeenByIndicator from './SeenByIndicator';

interface MessageBubbleProps {
  message: IMessageResponse;
  privateKey: CryptoKey;
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

const getDecryptFailureMessage = (
  message: IMessageResponse,
  myUserId: string
): string => {
  const hasSenderEntry = message.encryptedKeys.some(
    (entry) => entry.recipientId === message.senderId
  );
  if (!hasSenderEntry) {
    return "The sender hadn't set up messaging yet when this was sent.";
  }

  const hasMyEntry = message.encryptedKeys.some(
    (entry) => entry.recipientId === myUserId
  );
  if (!hasMyEntry) {
    return "You didn't have access to this conversation when it was sent.";
  }

  return 'Unable to decrypt this message.';
};

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

interface ReplyPreviewProps {
  replyToMessageId: string;
  repliedToMessage: IMessageResponse | undefined;
  conversation: IConversationSummary;
  privateKey: CryptoKey;
  myUserId: string;
}

const ReplyPreview = ({
  replyToMessageId,
  repliedToMessage,
  conversation,
  privateKey,
  myUserId,
}: ReplyPreviewProps) => {
  const { data, isFetching, isError } = useGetMessageByIdQuery(
    replyToMessageId,
    { skip: !!repliedToMessage }
  );
  const resolved = repliedToMessage ?? data?.data;
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!resolved || resolved.unsentAt || resolved.expiredAt) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    decryptMessage(resolved, privateKey, myUserId)
      .then((decrypted) => {
        if (!cancelled) setPreview(decodeMessagePayload(decrypted).text);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [resolved, privateKey, myUserId]);

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

const MessageBubble = ({
  message,
  privateKey,
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
  const [text, setText] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<IMessageLinkPreview | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState('');
  const [reactionTexts, setReactionTexts] = useState<Record<string, string>>({});
  const [deleteMessage] = useDeleteMessageMutation();
  const isOwn = message.senderId === myUserId;
  const isRemoved = Boolean(message.unsentAt || message.expiredAt);

  useEffect(() => {
    if (isRemoved) return;

    let cancelled = false;
    decryptMessage(message, privateKey, myUserId)
      .then((decrypted) => {
        if (cancelled) return;
        const payload = decodeMessagePayload(decrypted);
        setText(payload.text);
        setLinkPreview(payload.linkPreview ?? null);
      })
      .catch(() => {
        if (!cancelled) setText(getDecryptFailureMessage(message, myUserId));
      });

    return () => {
      cancelled = true;
    };
  }, [message, privateKey, myUserId]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      message.reactions.map(async (reaction) => {
        try {
          const emoji = await decryptMessage(reaction, privateKey, myUserId);
          return [reaction.userId, emoji] as const;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const entry of results) {
        if (entry) map[entry[0]] = entry[1];
      }
      setReactionTexts(map);
    });
    return () => {
      cancelled = true;
    };
  }, [message.reactions, privateKey, myUserId]);

  const reactionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const reaction of message.reactions) {
      const emoji = reactionTexts[reaction.userId];
      if (!emoji) continue;
      const users = groups.get(emoji) ?? [];
      users.push(reaction.userId);
      groups.set(emoji, users);
    }
    return Array.from(groups.entries());
  }, [message.reactions, reactionTexts]);

  const myReactionEmoji = reactionTexts[myUserId];

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
            privateKey={privateKey}
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
                : (text ?? '...')}

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
    </div>
  );
};

export default MessageBubble;
