import type { IConversationSummary, IMessageResponse } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';

interface SeenByIndicatorProps {
  message: IMessageResponse;
  conversation: IConversationSummary;
  viewerId: string;
}

const SeenByIndicator = ({
  message,
  conversation,
  viewerId,
}: SeenByIndicatorProps) => {
  const participants =
    conversation.type === 'group'
      ? conversation.participants
      : [conversation.otherParticipant];

  const messageTime = new Date(message.createdAt).getTime();

  const seenBy = participants.filter((participant) => {
    if (participant.id === viewerId || participant.id === message.senderId) {
      return false;
    }
    const readAt = conversation.participantReadState[participant.id];
    return readAt ? new Date(readAt).getTime() >= messageTime : false;
  });

  if (seenBy.length === 0) return null;

  return (
    <div className="mt-1 flex items-center justify-end gap-1.5">
      <div className="flex -space-x-1.5">
        {seenBy.slice(0, 3).map((participant) => (
          <Avatar
            key={participant.id}
            src={participant.avatarUrl}
            fallback={participant.name}
            size="sm"
          />
        ))}
      </div>
      <span className="text-[0.65rem] text-text-muted">
        {seenBy.length === 1
          ? 'Seen'
          : `Seen by ${seenBy.map((p) => p.name.split(' ')[0]).join(', ')}`}
      </span>
    </div>
  );
};

export default SeenByIndicator;
