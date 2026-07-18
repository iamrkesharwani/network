import { Loader2 } from 'lucide-react';
import HistoryCard from './HistoryCard';
import HistoryEmptyState from './HistoryEmptyState';
import HistoryErrorState from './HistoryErrorState';
import type { IHistoryResponse } from '@network/shared';

export interface HistoryListProps {
  entries: IHistoryResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRemove?: (entry: IHistoryResponse) => Promise<void> | void;
  onRetry?: () => void;
  isError?: boolean;
}

const HistoryList = ({
  entries,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onRemove,
  onRetry,
  isError = false,
}: HistoryListProps) => {
  if (isLoading && entries.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && entries.length === 0) {
    return <HistoryErrorState onRetry={onRetry} />;
  }

  if (entries.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
        {entries.map((entry) => (
          <HistoryCard key={entry.id} entry={entry} onRemove={onRemove} />
        ))}
      </div>

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

export default HistoryList;
