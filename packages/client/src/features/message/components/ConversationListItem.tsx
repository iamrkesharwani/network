import { useEffect, useState } from 'react';
import type { IConversationSummary } from '@network/shared';
import { getRelativeDate } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { cn } from '../../../shared/utils/cn';
import { useGetMessagesQuery } from '../messageApi';
import { decryptMessage } from '../keyManager';

interface ConversationListItemProps {
  conversation: IConversationSummary;
  isActive: boolean;
  privateKey: CryptoKey;
  myUserId: string;
  onSelect: (conversationId: string) => void;
}

const getLabel = (conversation: IConversationSummary): string =>
  conversation.type === 'direct'
    ? conversation.otherParticipant.name
    : conversation.groupName;

const getAvatarProps = (conversation: IConversationSummary) =>
  conversation.type === 'direct'
    ? {
        src: conversation.otherParticipant.avatarUrl,
        isOnline: conversation.otherParticipant.isOnline,
      }
    : { src: conversation.groupAvatarUrl, isOnline: undefined };

const ConversationListItem = ({
  conversation,
  isActive,
  privateKey,
  myUserId,
  onSelect,
}: ConversationListItemProps) => {
  const { data } = useGetMessagesQuery({
    conversationId: conversation.id,
    limit: 1,
  });
  const latestMessage = data?.data[0];
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!latestMessage) {
      setPreview('');
      return;
    }
    if (latestMessage.unsentAt) {
      setPreview('This message was removed');
      return;
    }

    let cancelled = false;
    decryptMessage(latestMessage, privateKey, myUserId)
      .then((decrypted) => {
        if (!cancelled) setPreview(decrypted);
      })
      .catch(() => {
        if (!cancelled) setPreview('Unable to decrypt message');
      });

    return () => {
      cancelled = true;
    };
  }, [latestMessage, privateKey, myUserId]);

  const avatarProps = getAvatarProps(conversation);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-raised',
        isActive && 'bg-surface-raised'
      )}
    >
      <Avatar
        src={avatarProps.src}
        isOnline={avatarProps.isOnline}
        fallback={getLabel(conversation)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {getLabel(conversation)}
        </p>
        <p className="truncate text-xs text-text-muted">
          {preview || ' '}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[0.65rem] text-text-muted">
          {getRelativeDate(conversation.lastMessageAt)}
        </span>
        {conversation.isUnread && (
          <span className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
};

export default ConversationListItem;
