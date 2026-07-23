import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Flag } from 'lucide-react';
import {
  CLIENT_ROUTES,
  MESSAGE_EDIT_WINDOW_MS,
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
import type { useSocket } from '../../../shared/hooks/useSocket';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useSetMessageReactionMutation,
  useRemoveMessageReactionMutation,
  useEditMessageMutation,
  useUploadMessageAttachmentMutation,
} from '../messageApi';
import { useMarkConversationReadMutation } from '../conversationApi';
import { useConversationRoom } from '../hooks/useConversationRoom';
import { encodeMessagePayload, decodeMessagePayload, fetchLinkPreview } from '../messagePayload';
import ReportModal from '../../report/components/ReportModal';
import { useBlockUserMutation } from '../../block/blockApi';
import { usePreference } from '../../settings/hooks/usePreference';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import PresenceDot from './PresenceDot';
import DisappearingMessagesMenu from './DisappearingMessagesMenu';
import MessageThreadSkeleton from '../skeleton/MessageThreadSkeleton';

interface MessageThreadProps {
  conversation: IConversationSummary;
  myUserId: string;
  socketRef: ReturnType<typeof useSocket>;
  onOpenGroupInfo?: () => void;
  onBack: () => void;
}

const getLabel = (conversation: IConversationSummary): string =>
  conversation.type === 'direct'
    ? conversation.otherParticipant.name
    : conversation.groupName;

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

const MessageThread = ({
  conversation,
  myUserId,
  socketRef,
  onOpenGroupInfo,
  onBack,
}: MessageThreadProps) => {
  const navigate = useNavigate();
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [replyTo, setReplyTo] = useState<IMessageResponse | null>(null);
  const { emitTyping } = useConversationRoom(socketRef, conversation.id);
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

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [uploadAttachment] = useUploadMessageAttachmentMutation();
  const [markConversationRead] = useMarkConversationReadMutation();

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

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [orderedMessages.length]);

  const handleSend = async (
    text: string,
    ttlOverride?: ConversationDisappearingTtl
  ) => {
    const linkPreview = privacy.linkPreviewsEnabled
      ? await fetchLinkPreview(text)
      : undefined;

    await sendMessage({
      conversationId: conversation.id,
      content: encodeMessagePayload({ text, ...(linkPreview && { linkPreview }) }),
      ...(replyTo && { replyToMessageId: replyTo.id }),
      ...(ttlOverride && { ttlOverride }),
    }).unwrap();
    setReplyTo(null);
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

  const headerAvatar =
    conversation.type === 'direct'
      ? {
          src: conversation.otherParticipant.avatarUrl,
          isOnline: conversation.otherParticipant.isOnline,
        }
      : { src: conversation.groupAvatarUrl, isOnline: undefined };

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
            fallback={getLabel(conversation)}
          />
          <div>
            <p className="font-semibold text-text-primary">
              {getLabel(conversation)}
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
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 py-4 text-center text-sm text-text-muted">
          <p>{getApiErrorMessage(error, "Couldn't load this conversation.")}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-3">
          {orderedMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              myUserId={myUserId}
              conversation={conversation}
              isLastFromSender={
                index === orderedMessages.length - 1 ||
                orderedMessages[index + 1]?.senderId !== message.senderId
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
          <div ref={bottomRef} />
        </div>
      )}

      <TypingIndicator
        socketRef={socketRef}
        conversationId={conversation.id}
        participantNameById={participantNameById}
        myUserId={myUserId}
      />

      <MessageInput
        onSend={handleSend}
        onSendAttachment={handleSendAttachment}
        onTyping={emitTyping}
        isSending={isSending}
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
