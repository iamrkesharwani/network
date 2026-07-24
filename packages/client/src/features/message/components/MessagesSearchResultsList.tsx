import type { IConversationSummary, IPublicProfile } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import {
  getConversationLabel,
  getConversationAvatarProps,
} from '../utils/conversationDisplay';

interface MessagesSearchResultsListProps {
  matchedConversations: IConversationSummary[];
  matchedPeople: IPublicProfile[];
  onSelectConversation: (conversationId: string) => void;
  onStartChat: (participantId: string) => void;
}

const MessagesSearchResultsList = ({
  matchedConversations,
  matchedPeople,
  onSelectConversation,
  onStartChat,
}: MessagesSearchResultsListProps) => {
  if (matchedConversations.length === 0 && matchedPeople.length === 0) {
    return <p className="px-2 py-4 text-sm text-text-muted">No matches found.</p>;
  }

  return (
    <div>
      {matchedConversations.length > 0 && (
        <div className="mb-2">
          <p className="px-2 pb-1 text-[0.65rem] font-semibold uppercase text-text-muted">
            Chats
          </p>
          {matchedConversations.map((conversation) => {
            const avatarProps = getConversationAvatarProps(conversation);
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-raised"
              >
                <Avatar
                  src={avatarProps.src}
                  isOnline={avatarProps.isOnline}
                  fallback={getConversationLabel(conversation)}
                />
                <span className="truncate text-sm text-text-primary">
                  {getConversationLabel(conversation)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {matchedPeople.length > 0 && (
        <div>
          <p className="px-2 pb-1 text-[0.65rem] font-semibold uppercase text-text-muted">
            Start a chat
          </p>
          {matchedPeople.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => onStartChat(person.id)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-raised"
            >
              <Avatar src={person.avatarUrl} fallback={person.name} />
              <span className="truncate text-sm text-text-primary">{person.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesSearchResultsList;
