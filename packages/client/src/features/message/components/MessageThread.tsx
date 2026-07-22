import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { IConversationSummary } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import type { useSocket } from '../../../shared/hooks/useSocket';
import { useGetMessagesQuery, useSendMessageMutation } from '../messageApi';
import { useMarkConversationReadMutation } from '../conversationApi';
import { useGetPublicKeysQuery } from '../keyBundleApi';
import { useConversationRoom } from '../hooks/useConversationRoom';
import { encryptForRecipients } from '../keyManager';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import PresenceDot from './PresenceDot';
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

const MESSAGE_LIST_ARGS = { limit: 30 };

const MessageThread = ({
  conversation,
  privateKey,
  myUserId,
  socketRef,
  onOpenGroupInfo,
  onBack,
}: MessageThreadProps) => {
  const { emitTyping } = useConversationRoom(socketRef, conversation.id);
  const { data, isLoading } = useGetMessagesQuery({
    conversationId: conversation.id,
    ...MESSAGE_LIST_ARGS,
  });
  const messages = data?.data ?? [];
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);

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
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
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

  const handleSend = async (text: string) => {
    if (!publicKeysData) return;

    const recipients = publicKeysData.data.map((key) => ({
      userId: key.userId,
      publicKey: key.publicKey,
    }));
    const { ciphertext, iv, encryptedKeys } = await encryptForRecipients(
      text,
      recipients
    );

    await sendMessage({
      conversationId: conversation.id,
      ciphertext,
      iv,
      encryptedKeys,
    }).unwrap();
  };

  const headerAvatar =
    conversation.type === 'direct'
      ? {
          src: conversation.otherParticipant.avatarUrl,
          isOnline: conversation.otherParticipant.isOnline,
        }
      : { src: conversation.groupAvatarUrl, isOnline: undefined };

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

      <MessageInput onSend={handleSend} onTyping={emitTyping} isSending={isSending} />
    </div>
  );
};

export default MessageThread;
