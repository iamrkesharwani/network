import type { IShortResponse } from '@network/shared';
import ShortListRow from '../components/ShortListRow';
import ShortEmptyState from '../components/ShortEmptyState';
import ShortErrorState from '../components/ShortErrorState';
import { Loader2 } from 'lucide-react';

export interface ShortListProps {
  shorts: IShortResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onDelete?: (short: IShortResponse) => Promise<void> | void;
  onToggleVisibility?: (short: IShortResponse) => Promise<void> | void;
  onRetry?: () => void;
  isOwner?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

const ShortList = ({
  shorts,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onDelete,
  onToggleVisibility,
  onRetry,
  isOwner = false,
  isError = false,
  emptyMessage = 'No shorts yet',
  emptySubMessage = "When shorts are added they'll appear here.",
}: ShortListProps) => {
  if (isLoading && shorts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && shorts.length === 0) {
    return <ShortErrorState onRetry={onRetry} />;
  }

  if (shorts.length === 0) {
    return (
      <ShortEmptyState message={emptyMessage} subMessage={emptySubMessage} />
    );
  }

  return (
    <div className="divide-y divide-border">
      {shorts.map((short) => (
        <ShortListRow
          key={short.id}
          short={short}
          isOwner={isOwner}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-surface-overlay border border-border transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShortList;
