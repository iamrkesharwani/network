import type { IMessageResponse } from '@network/shared';
import { getRelativeDate } from '@network/shared';
import { decodeMessagePayload } from '../messagePayload';

interface ThreadSearchResultsListProps {
  query: string;
  matches: IMessageResponse[];
  isSearching: boolean;
  participantNameById: Record<string, string>;
  myUserId: string;
  onSelect: (messageId: string) => void;
}

const ThreadSearchResultsList = ({
  query,
  matches,
  isSearching,
  participantNameById,
  myUserId,
  onSelect,
}: ThreadSearchResultsListProps) => {
  if (!query.trim()) {
    return (
      <p className="px-2 py-4 text-sm text-text-muted">
        Type to search this conversation.
      </p>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="px-2 py-4 text-sm text-text-muted">
        {isSearching ? 'Searching…' : 'No matches found.'}
      </p>
    );
  }

  return (
    <div>
      {matches.map((message) => {
        const senderName =
          message.senderId === myUserId
            ? 'You'
            : (participantNameById[message.senderId] ?? '');
        return (
          <button
            key={message.id}
            type="button"
            onClick={() => onSelect(message.id)}
            className="flex w-full flex-col items-start gap-0.5 rounded-lg p-2 text-left hover:bg-surface-raised"
          >
            <span className="flex w-full items-center justify-between gap-2 text-xs text-text-muted">
              <span className="font-medium text-text-primary">{senderName}</span>
              <span className="shrink-0">{getRelativeDate(message.createdAt)}</span>
            </span>
            <span className="w-full truncate text-sm text-text-secondary">
              {decodeMessagePayload(message.content).text}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ThreadSearchResultsList;
