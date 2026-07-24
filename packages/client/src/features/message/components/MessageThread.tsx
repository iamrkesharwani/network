import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, X } from 'lucide-react';
import {
  CLIENT_ROUTES,
  MESSAGE_EDIT_WINDOW_MS,
  MESSAGE_GROUP_GAP_MS,
  MESSAGE_THREAD_PAGE_LIMIT,
  type ConversationDisappearingTtl,
  type IConversationSummary,
  type IMessageResponse,
  type MessageAttachmentType,
} from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import Spinner from '../../../shared/ui/primitives/Spinner';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import { getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import type { useSocket } from '../../../shared/hooks/useSocket';
import {
  messageApi,
  useGetMessagesQuery,
  useSendMessageMutation,
  useSetMessageReactionMutation,
  useRemoveMessageReactionMutation,
  useEditMessageMutation,
  useUploadMessageAttachmentMutation,
} from '../messageApi';
import {
  conversationApi,
  CONVERSATION_LIST_ARGS,
  useMarkConversationReadMutation,
} from '../conversationApi';
import { useConversationRoom } from '../hooks/useConversationRoom';
import { useThreadMessageSearch } from '../hooks/useThreadMessageSearch';
import { encodeMessagePayload, decodeMessagePayload, fetchLinkPreview } from '../messagePayload';
import {
  getConversationLabel,
  getConversationAvatarProps,
} from '../utils/conversationDisplay';
import ReportModal from '../../report/components/ReportModal';
import { useBlockUserMutation } from '../../block/blockApi';
import { usePreference } from '../../settings/hooks/usePreference';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import PendingMessageBubble, { type PendingMessage } from './PendingMessageBubble';
import TypingIndicator from './TypingIndicator';
import PresenceDot from './PresenceDot';
import ThreadOverflowMenu from './ThreadOverflowMenu';
import ThreadSearchResultsList from './ThreadSearchResultsList';
import MessageThreadSkeleton from '../skeleton/MessageThreadSkeleton';

interface MessageThreadProps {
  conversation: IConversationSummary;
  myUserId: string;
  socket: ReturnType<typeof useSocket>;
  onOpenGroupInfo?: () => void;
  onBack: () => void;
}

const getParticipantLabel = (
  conversation: IConversationSummary,
  userId: string,
  myUserId: string
): string => {
  if (userId === myUserId) return 'yourself';
  const participants =
    conversation.type === 'direct'
      ? [conversation.otherParticipant]
      : conversation.participants;
  return (
    participants.find((participant) => participant.id === userId)?.name ?? ''
  );
};

const MESSAGE_LIST_ARGS = { limit: MESSAGE_THREAD_PAGE_LIMIT };
const LOAD_OLDER_SCROLL_THRESHOLD_PX = 100;
const HEADER_COLLAPSIBLE_TRANSITION = { duration: 0.2 };

const isSameMessageGroup = (
  a: IMessageResponse,
  b: IMessageResponse
): boolean =>
  a.senderId === b.senderId &&
  Math.abs(
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) < MESSAGE_GROUP_GAP_MS;

const MessageThread = ({
  conversation,
  myUserId,
  socket,
  onOpenGroupInfo,
  onBack,
}: MessageThreadProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [replyTo, setReplyTo] = useState<IMessageResponse | null>(null);
  const { emitTyping } = useConversationRoom(socket, conversation.id);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...MESSAGE_LIST_ARGS,
    ...(cursor !== undefined && { cursor }),
  });
  const messages = data?.data ?? [];
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const messagesById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages]
  );

  const [isThreadSearchOpen, setIsThreadSearchOpen] = useState(false);
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const {
    matches: threadSearchMatches,
    isSearching: isThreadSearching,
  } = useThreadMessageSearch(conversation.id, threadSearchQuery, messages);

  const closeThreadSearch = () => {
    setThreadSearchQuery('');
    setIsThreadSearchOpen(false);
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    });
  };

  const handleSelectSearchResult = (messageId: string) => {
    setThreadSearchQuery('');
    setIsThreadSearchOpen(false);
    requestAnimationFrame(() => {
      document
        .getElementById(`message-${messageId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const [setReaction] = useSetMessageReactionMutation();
  const [removeReaction] = useRemoveMessageReactionMutation();
  const [editMessage] = useEditMessageMutation();
  const [privacy] = usePreference('privacy');

  const [sendMessage] = useSendMessageMutation();
  const [uploadAttachment] = useUploadMessageAttachmentMutation();
  const [markConversationRead] = useMarkConversationReadMutation();
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const visiblePendingMessages = useMemo(
    () =>
      pendingMessages.filter((pending) => {
        if (pending.status === 'failed') return true;
        const alreadyLanded = messages.some(
          (message) =>
            message.senderId === myUserId &&
            message.content === pending.content &&
            new Date(message.createdAt).getTime() >= pending.startedAt
        );
        return !alreadyLanded;
      }),
    [pendingMessages, messages, myUserId]
  );

  const replyToPreview = useMemo(() => {
    if (!replyTo || replyTo.unsentAt) return null;
    return decodeMessagePayload(replyTo.content).text;
  }, [replyTo]);

  const participantNameById = useMemo(() => {
    const entries: [string, string][] =
      conversation.type === 'direct'
        ? [
            [
              conversation.otherParticipant.id,
              conversation.otherParticipant.name,
            ],
          ]
        : conversation.participants.map(
            (participant) =>
              [participant.id, participant.name] as [string, string]
          );
    return Object.fromEntries(entries);
  }, [conversation]);

  useEffect(() => {
    if (conversation.isUnread) markConversationRead(conversation.id);
  }, [conversation.id, conversation.isUnread, markConversationRead]);

  useEffect(() => {
    setPendingMessages([]);
    setCursor(undefined);
  }, [conversation.id]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const isLoadingOlderRef = useRef(false);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (isLoadingOlderRef.current && container && prevScrollHeightRef.current !== null) {
      container.scrollTop += container.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
      isLoadingOlderRef.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [orderedMessages.length, visiblePendingMessages.length]);

  const handleThreadScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (isFetching || !data?.meta.hasNextPage || !data.meta.nextCursor) return;
    if (container.scrollTop > LOAD_OLDER_SCROLL_THRESHOLD_PX) return;
    prevScrollHeightRef.current = container.scrollHeight;
    isLoadingOlderRef.current = true;
    setCursor(data.meta.nextCursor);
  };

  const sendWithPendingState = async (
    content: string,
    replyToMessageId?: string,
    ttlOverride?: ConversationDisappearingTtl
  ) => {
    const clientId = crypto.randomUUID();
    setPendingMessages((prev) => [
      ...prev,
      { clientId, content, replyToMessageId, status: 'sending', startedAt: Date.now() },
    ]);

    try {
      const result = await sendMessage({
        conversationId: conversation.id,
        content,
        ...(replyToMessageId && { replyToMessageId }),
        ...(ttlOverride && { ttlOverride }),
      }).unwrap();

      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: conversation.id, ...MESSAGE_LIST_ARGS },
          (draft) => {
            if (draft.data.some((message) => message.id === result.data.id)) return;
            draft.data.unshift(result.data);
          }
        )
      );
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: conversation.id, limit: 1 },
          (draft) => {
            draft.data = [result.data];
          }
        )
      );
      dispatch(
        conversationApi.util.updateQueryData(
          'getConversations',
          CONVERSATION_LIST_ARGS,
          (draft) => {
            const index = draft.data.findIndex((item) => item.id === conversation.id);
            if (index === -1) return;
            const [existing] = draft.data.splice(index, 1);
            existing.lastMessageAt = result.data.createdAt;
            draft.data.unshift(existing);
          }
        )
      );
      setPendingMessages((prev) => prev.filter((m) => m.clientId !== clientId));
    } catch {
      setPendingMessages((prev) =>
        prev.map((m) => (m.clientId === clientId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  const handleSend = async (
    text: string,
    ttlOverride?: ConversationDisappearingTtl
  ) => {
    const linkPreview = privacy.linkPreviewsEnabled
      ? await fetchLinkPreview(text)
      : undefined;
    const content = encodeMessagePayload({
      text,
      ...(linkPreview && { linkPreview }),
    });
    const replyToMessageId = replyTo?.id;
    setReplyTo(null);
    await sendWithPendingState(content, replyToMessageId, ttlOverride);
  };

  const handleRetryPendingMessage = (clientId: string) => {
    const pending = pendingMessages.find((m) => m.clientId === clientId);
    if (!pending) return;
    setPendingMessages((prev) => prev.filter((m) => m.clientId !== clientId));
    sendWithPendingState(pending.content, pending.replyToMessageId);
  };

  const handleSendAttachment = async (
    file: File,
    type: MessageAttachmentType,
    duration?: number
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversation.id);
    formData.append('type', type);
    if (duration !== undefined) formData.append('duration', String(duration));

    const uploaded = await uploadAttachment(formData).unwrap();

    await sendMessage({
      conversationId: conversation.id,
      content: encodeMessagePayload({ text: '' }),
      attachmentStorageKey: uploaded.data.storageKey,
      ...(replyTo && { replyToMessageId: replyTo.id }),
    }).unwrap();
    setReplyTo(null);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    await setReaction({ messageId, content: emoji }).unwrap();
  };

  const handleRemoveReaction = async (messageId: string) => {
    await removeReaction({ messageId }).unwrap();
  };

  const handleEdit = async (messageId: string, text: string) => {
    await editMessage({
      messageId,
      content: encodeMessagePayload({ text }),
    }).unwrap();
  };

  const headerAvatar = getConversationAvatarProps(conversation);

  const handleBlock = async () => {
    if (conversation.type !== 'direct') return;
    await blockUser(conversation.otherParticipant.username).unwrap();
    setIsBlockConfirmOpen(false);
    navigate(CLIENT_ROUTES.MESSAGES, { replace: true });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-1 border-b border-border pb-3">
        <motion.div
          className="shrink-0 overflow-hidden md:!w-auto md:!opacity-100"
          animate={{
            width: isThreadSearchOpen ? 0 : 'auto',
            opacity: isThreadSearchOpen ? 0 : 1,
          }}
          transition={HEADER_COLLAPSIBLE_TRANSITION}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover md:hidden"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </motion.div>

        {isThreadSearchOpen ? (
          <div className="relative flex flex-1 items-center">
            <input
              autoFocus
              value={threadSearchQuery}
              onChange={(event) => setThreadSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') closeThreadSearch();
              }}
              placeholder="Search this conversation..."
              className="w-full rounded-lg border border-border bg-surface-raised py-1.5 pl-3 pr-8 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={closeThreadSearch}
              aria-label="Close search"
              className="absolute right-2 rounded p-0.5 text-icon hover:text-icon-hover"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              conversation.type === 'group'
                ? onOpenGroupInfo?.()
                : navigate(buildProfilePath(conversation.otherParticipant.username))
            }
            className="flex flex-1 items-center gap-3 text-left"
          >
            <Avatar
              src={headerAvatar.src}
              isOnline={headerAvatar.isOnline}
              fallback={getConversationLabel(conversation)}
            />
            <div>
              <p className="font-semibold text-text-primary">
                {getConversationLabel(conversation)}
              </p>
              {conversation.type === 'direct' && (
                <PresenceDot
                  isOnline={conversation.otherParticipant.isOnline}
                  lastActiveAt={conversation.otherParticipant.lastActiveAt}
                  showLabel
                />
              )}
            </div>
          </button>
        )}

        <motion.div
          className="shrink-0 overflow-hidden md:!w-auto md:!opacity-100"
          animate={{
            width: isThreadSearchOpen ? 0 : 'auto',
            opacity: isThreadSearchOpen ? 0 : 1,
          }}
          transition={HEADER_COLLAPSIBLE_TRANSITION}
        >
          <button
            type="button"
            onClick={() => setIsThreadSearchOpen(true)}
            aria-label="Search this conversation"
            className="rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
          >
            <Search className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        </motion.div>

        <ThreadOverflowMenu
          conversation={conversation}
          canEditDisappearing={
            conversation.type === 'direct' || conversation.isOwnedByViewer
          }
          isCollapsed={isThreadSearchOpen}
          onOpenGroupInfo={conversation.type === 'group' ? onOpenGroupInfo : undefined}
          onOpenReport={conversation.type === 'direct' ? () => setIsReportOpen(true) : undefined}
          onOpenBlockConfirm={
            conversation.type === 'direct' ? () => setIsBlockConfirmOpen(true) : undefined
          }
          onNavigateBack={onBack}
        />
      </div>

      {isLoading ? (
        <MessageThreadSkeleton />
      ) : isError ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-2 py-4 text-center text-sm text-text-muted">
          <div className="chat-thread-bg" />
          <p>{getApiErrorMessage(error, "Couldn't load this conversation.")}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="relative flex-1">
          <div className="chat-thread-bg" />
          {isThreadSearchOpen ? (
            <div className="absolute inset-0 overflow-y-auto py-3">
              <ThreadSearchResultsList
                query={threadSearchQuery}
                matches={threadSearchMatches}
                isSearching={isThreadSearching}
                participantNameById={participantNameById}
                myUserId={myUserId}
                onSelect={handleSelectSearchResult}
              />
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onScroll={handleThreadScroll}
              className="absolute inset-0 overflow-y-auto py-3"
            >
              {isFetching && cursor !== undefined && (
                <div className="flex justify-center py-2">
                  <Spinner size="sm" className="text-text-muted" />
                </div>
              )}
              {orderedMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  id={`message-${message.id}`}
                  message={message}
                  myUserId={myUserId}
                  conversation={conversation}
                  isFirstFromSender={
                    index === 0 ||
                    !isSameMessageGroup(orderedMessages[index - 1], message)
                  }
                  isLastFromSender={
                    index === orderedMessages.length - 1 ||
                    !isSameMessageGroup(message, orderedMessages[index + 1])
                  }
                  canEdit={
                    message.senderId === myUserId &&
                    Date.now() - new Date(message.createdAt).getTime() <
                      MESSAGE_EDIT_WINDOW_MS
                  }
                  repliedToMessage={
                    message.replyToMessageId
                      ? messagesById.get(message.replyToMessageId)
                      : undefined
                  }
                  onReply={setReplyTo}
                  onReact={handleReact}
                  onRemoveReaction={handleRemoveReaction}
                  onEdit={handleEdit}
                />
              ))}
              {visiblePendingMessages.map((pending) => (
                <PendingMessageBubble
                  key={pending.clientId}
                  pending={pending}
                  onRetry={handleRetryPendingMessage}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}

      <TypingIndicator
        socket={socket}
        conversationId={conversation.id}
        participantNameById={participantNameById}
        myUserId={myUserId}
      />

      <MessageInput
        onSend={handleSend}
        onSendAttachment={handleSendAttachment}
        onTyping={emitTyping}
        replyToLabel={
          replyTo
            ? `${getParticipantLabel(conversation, replyTo.senderId, myUserId)}: ${replyToPreview ?? '…'}`
            : undefined
        }
        onCancelReply={() => setReplyTo(null)}
      />

      {conversation.type === 'direct' && (
        <ConfirmModal
          isOpen={isBlockConfirmOpen}
          onClose={() => setIsBlockConfirmOpen(false)}
          onConfirm={handleBlock}
          title={`Block ${conversation.otherParticipant.name}?`}
          description="They won't be able to message you or see your content, and this conversation will be removed from your list. You can unblock them later from your Privacy settings."
          confirmLabel="Block"
          isLoading={isBlocking}
        />
      )}

      {conversation.type === 'direct' && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          contentType="conversation"
          contentId={conversation.id}
          authorId=""
          isOwnContent={false}
        />
      )}
    </div>
  );
};

export default MessageThread;
