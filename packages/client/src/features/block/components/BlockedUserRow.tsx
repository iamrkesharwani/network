import type { IBlockedUserListItem } from '@network/shared';
import Avatar from '../../../shared/ui/primitives/Avatar';
import Button from '../../../shared/ui/primitives/Button';
import { useUnblockUserMutation } from '../blockApi';

export interface BlockedUserRowProps {
  item: IBlockedUserListItem;
}

const BlockedUserRow = ({ item }: BlockedUserRowProps) => {
  const [unblock, { isLoading }] = useUnblockUserMutation();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3">
      <Avatar src={item.avatarUrl} fallback={item.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {item.name}
        </p>
        <p className="truncate text-xs text-text-secondary">@{item.username}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        isLoading={isLoading}
        onClick={() => unblock(item.username)}
      >
        Unblock
      </Button>
    </div>
  );
};

export default BlockedUserRow;
