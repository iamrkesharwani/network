import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Flag } from 'lucide-react';
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
import { encodeMessagePayload, decodeMessagePayload, fetchLinkPreview } from '../messagePayload';
import {
  getConversationLabel,
  getConversationAvatarProps,
} from '../utils/conversationDisplay';
import ReportModal from '../../report/components/ReportModal';
import { useBlockUserMutation } from '../../block/blockApi';
import { usePreference } from '../../settings/hooks/usePreference';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import PendingMessageBubble, { type PendingMessage } from './PendingMessageBubble';
import TypingIndicator from './TypingIndicator';
import PresenceDot from './PresenceDot';
import DisappearingMessagesMenu from './DisappearingMessagesMenu';
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
  const { data, isLoading, isError, error, refetch } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...MESSAGE_LIST_ARGS,
  });
  const messages = data?.data ?? [];
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const messagesById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages]
  );

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
  }, [conversation.id]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [orderedMessages.length, visiblePendingMessages.length]);

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
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="shrink-0 rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover md:hidden"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={onOpenGroupInfo}
          disabled={conversation.type !== 'group'}
          className="flex flex-1 items-center gap-3 text-left disabled:cursor-default"
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

        <DisappearingMessagesMenu
          conversation={conversation}
          canEdit={
            conversation.type === 'direct' || conversation.isOwnedByViewer
          }
        />

        {conversation.type === 'direct' && (
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            aria-label="Report this conversation"
            className="shrink-0 rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
          >
            <Flag className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        )}

        {conversation.type === 'direct' && (
          <button
            type="button"
            onClick={() => setIsBlockConfirmOpen(true)}
            aria-label={`Block ${conversation.otherParticipant.name}`}
            className="shrink-0 rounded-lg p-1.5 text-icon hover:bg-surface-raised hover:text-icon-hover"
          >
            <Ban className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        )}
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
          <div className="absolute inset-0 overflow-y-auto py-3">
            {orderedMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
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
