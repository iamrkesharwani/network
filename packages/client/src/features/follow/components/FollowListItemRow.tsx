import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { IFollowListItem } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import FollowButton from './FollowButton';

export interface FollowListItemRowProps {
  item: IFollowListItem;
  canRemove?: boolean;
  onRemove?: (item: IFollowListItem) => void;
}

const FollowListItemRow = ({
  item,
  canRemove = false,
  onRemove,
}: FollowListItemRowProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 transition-colors hover:border-primary/30">
    <Link
      to={buildProfilePath(item.username)}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      <Avatar src={item.avatarUrl} fallback={item.name} size="md" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">
          {item.name}
        </p>
        <p className="truncate text-xs text-text-secondary">@{item.username}</p>
      </div>
    </Link>

    <FollowButton
      username={item.username}
      followState={item.followState ?? 'none'}
      className="shrink-0"
    />

    {canRemove && (
      <button
        type="button"
        aria-label={`Remove ${item.name} from followers`}
        onClick={() => onRemove?.(item)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-error-subtle hover:text-error"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default FollowListItemRow;
