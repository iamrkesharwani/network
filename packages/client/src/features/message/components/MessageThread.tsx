import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban } from 'lucide-react';
import {
  CLIENT_ROUTES,
  MESSAGE_EDIT_WINDOW_MS,
  type ConversationDisappearingTtl,
  type IConversationSummary,
  type IMessageResponse,
  type MessageAttachmentType,
} from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import type { useSocket } from '../../../shared/hooks/useSocket';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useSetMessageReactionMutation,
  useRemoveMessageReactionMutation,
  useEditMessageMutation,
  usePresignMessageAttachmentMutation,
} from '../messageApi';
import { useMarkConversationReadMutation } from '../conversationApi';
import { useGetPublicKeysQuery } from '../keyBundleApi';
import { useConversationRoom } from '../hooks/useConversationRoom';
import {
  encryptForRecipients,
  decryptMessage,
  generateMessageKey,
  encryptFile,
  encryptTextWithKey,
  wrapMessageKeyForRecipients,
} from '../keyManager';
import {
  encodeMessagePayload,
  decodeMessagePayload,
  fetchLinkPreview,
  type IMessagePayload,
} from '../messagePayload';
import { uploadEncryptedAttachment } from '../utils/uploadAttachment';
import { useBlockUserMutation } from '../../block/blockApi';
import { usePreference } from '../../settings/hooks/usePreference';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import PresenceDot from './PresenceDot';
import DisappearingMessagesMenu from './DisappearingMessagesMenu';
import SafetyNumberBadge from './SafetyNumberBadge';
import VerifyContactModal from './VerifyContactModal';
import MessageThreadSkeleton from '../skeleton/MessageThreadSkeleton';

interface MessageThreadProps {
  conversation: IConversationSummary;
  privateKey: CryptoKey;
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
  return participants.find((participant) => participant.id === userId)?.name ?? '';
};

const MESSAGE_LIST_ARGS = { limit: 30 };

const MessageThread = ({
  conversation,
  privateKey,
  myUserId,
  socketRef,
  onOpenGroupInfo,
  onBack,
}: MessageThreadProps) => {
  const navigate = useNavigate();
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [replyTo, setReplyTo] = useState<IMessageResponse | null>(null);
  const [replyToPreview, setReplyToPreview] = useState<string | null>(null);
  const { emitTyping } = useConversationRoom(socketRef, conversation.id);
  const { data, isLoading } = useGetMessagesQuery({
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

  const recipientIds = useMemo(
    () =>
      conversation.type === 'direct'
        ? [conversation.otherParticipant.id, myUserId]
        : conversation.participants.map((participant) => participant.id),
    [conversation, myUserId]
  );

  const { data: publicKeysData } = useGetPublicKeysQuery(recipientIds, {
    skip: recipientIds.length === 0,
  });
  const myPublicKey = publicKeysData?.data.find(
    (key) => key.userId === myUserId
  )?.publicKey;
  const otherParticipantPublicKey =
    conversation.type === 'direct'
      ? publicKeysData?.data.find(
          (key) => key.userId === conversation.otherParticipant.id
        )?.publicKey
      : undefined;
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [presignAttachment] = usePresignMessageAttachmentMutation();
  const [markConversationRead] = useMarkConversationReadMutation();

  const participantNameById = useMemo(() => {
    const entries: [string, string][] =
      conversation.type === 'direct'
        ? [[conversation.otherParticipant.id, conversation.otherParticipant.name]]
        : conversation.participants.map(
            (participant) => [participant.id, participant.name] as [string, string]
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

  useEffect(() => {
    if (!replyTo || replyTo.unsentAt) {
      setReplyToPreview(null);
      return;
    }
    let cancelled = false;
    decryptMessage(replyTo, privateKey, myUserId)
      .then((decrypted) => {
        if (!cancelled) setReplyToPreview(decodeMessagePayload(decrypted).text);
      })
      .catch(() => {
        if (!cancelled) setReplyToPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [replyTo, privateKey, myUserId]);

  const getRecipients = () =>
    publicKeysData?.data.map((key) => ({
      userId: key.userId,
      publicKey: key.publicKey,
    })) ?? [];

  const handleSend = async (
    text: string,
    ttlOverride?: ConversationDisappearingTtl
  ) => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;

    const linkPreview = privacy.linkPreviewsEnabled
      ? await fetchLinkPreview(text)
      : undefined;

    const { ciphertext, iv, encryptedKeys } = await encryptForRecipients(
      encodeMessagePayload({ text, ...(linkPreview && { linkPreview }) }),
      recipients
    );

    await sendMessage({
      conversationId: conversation.id,
      ciphertext,
      iv,
      encryptedKeys,
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
    const recipients = getRecipients();
    if (recipients.length === 0) return;

    const messageKey = await generateMessageKey();
    const fileBuffer = await file.arrayBuffer();
    const { ciphertext: attachmentCiphertext, iv: attachmentIv } =
      await encryptFile(messageKey, fileBuffer);

    const presigned = await presignAttachment({
      conversationId: conversation.id,
      contentLength: attachmentCiphertext.byteLength,
    }).unwrap();

    await uploadEncryptedAttachment(
      presigned.data.uploadUrl,
      attachmentCiphertext
    );

    const payload: IMessagePayload = {
      text: '',
      attachment: {
        type,
        storageKey: presigned.data.storageKey,
        attachmentIv,
        mimeType: file.type,
        size: file.size,
        ...(duration !== undefined && { duration }),
      },
    };

    const { ciphertext, iv } = await encryptTextWithKey(
      messageKey,
      encodeMessagePayload(payload)
    );
    const encryptedKeys = await wrapMessageKeyForRecipients(
      messageKey,
      recipients
    );

    await sendMessage({
      conversationId: conversation.id,
      ciphertext,
      iv,
      encryptedKeys,
      attachmentStorageKey: presigned.data.storageKey,
      ...(replyTo && { replyToMessageId: replyTo.id }),
    }).unwrap();
    setReplyTo(null);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;
    const { ciphertext, iv, encryptedKeys } = await encryptForRecipients(
      emoji,
      recipients
    );
    await setReaction({ messageId, ciphertext, iv, encryptedKeys }).unwrap();
  };

  const handleRemoveReaction = async (messageId: string) => {
    await removeReaction({ messageId }).unwrap();
  };

  const handleEdit = async (messageId: string, text: string) => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;
    const { ciphertext, iv, encryptedKeys } = await encryptForRecipients(
      encodeMessagePayload({ text }),
      recipients
    );
    await editMessage({ messageId, ciphertext, iv, encryptedKeys }).unwrap();
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
          <SafetyNumberBadge
            myUserId={myUserId}
            myPublicKey={myPublicKey}
            contactUserId={conversation.otherParticipant.id}
            contactPublicKey={otherParticipantPublicKey}
            onClick={() => setIsVerifyOpen(true)}
          />
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
      ) : (
        <div className="flex-1 overflow-y-auto py-3">
          {orderedMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              privateKey={privateKey}
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
        <VerifyContactModal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          myUserId={myUserId}
          contactUserId={conversation.otherParticipant.id}
          contactName={conversation.otherParticipant.name}
        />
      )}
    </div>
  );
};

export default MessageThread;
