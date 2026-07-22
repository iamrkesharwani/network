import { useNavigate } from 'react-router-dom';
import type { INotificationListItem } from '@network/shared';
import { getRelativeDate } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { cn } from '../../../shared/utils/cn';
import { getNotificationMessage, getNotificationPath } from '../utils/notificationDisplay';

export interface NotificationItemProps {
  item: INotificationListItem;
  onRead: (notificationId: string) => void;
}

const NotificationItem = ({ item, onRead }: NotificationItemProps) => {
  const navigate = useNavigate();
  const primaryActor = item.actors[0];
  const path = getNotificationPath(item);

  const handleClick = () => {
    if (!item.isRead) onRead(item.id);
    if (path) navigate(path);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-primary',
        !item.isRead && 'bg-primary/5'
      )}
    >
      <Avatar
        size="sm"
        src={primaryActor?.avatarUrl}
        alt={primaryActor?.name}
        fallback={primaryActor?.name}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-snug">
          {getNotificationMessage(item)}
        </p>
        <span className="text-xs text-text-muted">
          {getRelativeDate(item.createdAt)}
        </span>
      </div>

      {!item.isRead && (
        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
};

export default NotificationItem;
