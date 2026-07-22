import { useState } from 'react';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../notificationApi';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import NotificationItem from './NotificationItem';
import NotificationItemSkeleton from '../skeleton/NotificationItemSkeleton';

export interface NotificationListProps {
  className?: string;
}

const NotificationList = ({ className }: NotificationListProps) => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, isFetching } = useGetNotificationsQuery({
    limit: 20,
    ...(cursor !== undefined && { cursor }),
  });
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = data?.data ?? [];

  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: 4 }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <p className="text-sm text-text-muted">
          You have no notifications yet.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      isLoading={isFetching}
      hasMore={data?.meta.hasNextPage ?? false}
      onLoadMore={() => {
        if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
      }}
      className={className}
    >
      <div className="divide-y divide-border">
        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            item={item}
            onRead={(id) => markAsRead(id)}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default NotificationList;
