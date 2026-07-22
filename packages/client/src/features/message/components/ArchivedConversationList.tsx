import { useState } from 'react';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import {
  useGetArchivedConversationsQuery,
  CONVERSATION_ARCHIVED_LIST_ARGS,
} from '../conversationApi';
import ConversationListItem from './ConversationListItem';
import ConversationListItemSkeleton from '../skeleton/ConversationListItemSkeleton';

interface ArchivedConversationListProps {
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  privateKey: CryptoKey;
  myUserId: string;
}

const ArchivedConversationList = ({
  activeConversationId,
  onSelect,
  privateKey,
  myUserId,
}: ArchivedConversationListProps) => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching } = useGetArchivedConversationsQuery({
    ...CONVERSATION_ARCHIVED_LIST_ARGS,
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

  if (conversations.length === 0) {
    return (
      <p className="px-2 py-4 text-sm text-text-muted">No archived chats.</p>
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
          privateKey={privateKey}
          myUserId={myUserId}
          onSelect={onSelect}
        />
      ))}
    </InfiniteScroll>
  );
};

export default ArchivedConversationList;
