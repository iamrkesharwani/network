import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import {
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
} from '../notificationApi';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useGetUnreadCountQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const unreadCount = data?.data.count ?? 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-112 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:underline focus:outline-none"
              >
                Mark all as read
              </button>
            )}
          </div>

          <NotificationList />

          <Link
            to={CLIENT_ROUTES.NOTIFICATIONS}
            onClick={() => setIsOpen(false)}
            className="block text-center text-xs text-primary py-2.5 border-t border-border hover:bg-surface-raised transition-colors"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
