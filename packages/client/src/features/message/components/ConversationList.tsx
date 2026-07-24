import { useState } from 'react';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import { useGetConversationsQuery, CONVERSATION_LIST_ARGS } from '../conversationApi';
import { getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';
import Button from '../../../shared/ui/primitives/Button';
import ConversationListItem from './ConversationListItem';
import ConversationListItemSkeleton from '../skeleton/ConversationListItemSkeleton';

interface ConversationListProps {
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  isSelectModeOn?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (conversationId: string) => void;
}

const ConversationList = ({
  activeConversationId,
  onSelect,
  isSelectModeOn = false,
  selectedIds,
  onToggleSelect,
}: ConversationListProps) => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetConversationsQuery({
      ...CONVERSATION_LIST_ARGS,
      ...(cursor !== undefined && { cursor }),
    });

  const conversations = data?.data ?? [];

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <ConversationListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-4 text-center text-sm text-text-muted">
        <p>{getApiErrorMessage(error, "Couldn't load your conversations.")}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="px-2 py-4 text-sm text-text-muted">No conversations yet.</p>
    );
  }

  return (
    <InfiniteScroll
      isLoading={isFetching}
      hasMore={data?.meta.hasNextPage ?? false}
      onLoadMore={() => {
        if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
      }}
    >
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onSelect={onSelect}
          isSelectModeOn={isSelectModeOn}
          isSelected={selectedIds?.has(conversation.id) ?? false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </InfiniteScroll>
  );
};

export default ConversationList;
