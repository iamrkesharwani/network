import { Link } from 'react-router-dom';
import type { IFollowRequestListItem } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import {
  useApproveFollowRequestMutation,
  useDenyFollowRequestMutation,
} from '../followApi';

export interface FollowRequestRowProps {
  item: IFollowRequestListItem;
}

const FollowRequestRow = ({ item }: FollowRequestRowProps) => {
  const [approve, { isLoading: isApproving }] = useApproveFollowRequestMutation();
  const [deny, { isLoading: isDenying }] = useDenyFollowRequestMutation();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3">
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

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          isLoading={isDenying}
          onClick={() => deny(item.id)}
        >
          Deny
        </Button>
        <Button size="sm" isLoading={isApproving} onClick={() => approve(item.id)}>
          Approve
        </Button>
      </div>
    </div>
  );
};

export default FollowRequestRow;
