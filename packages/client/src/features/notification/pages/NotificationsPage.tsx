import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useMarkAllAsReadMutation, useGetUnreadCountQuery } from '../notificationApi';
import NotificationList from '../components/NotificationList';

const NotificationsPage = () => {
  usePageTitle('Notifications');

  const { data } = useGetUnreadCountQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const unreadCount = data?.data.count ?? 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-text-primary">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-sm text-primary hover:underline focus:outline-none"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <NotificationList />
      </div>
    </div>
  );
};

export default NotificationsPage;
