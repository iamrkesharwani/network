import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import HistoryList from '../../history/components/HistoryList';
import Button from '../../../shared/ui/primitives/Button';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import type { IHistoryResponse } from '@network/shared';
import {
  useGetHistoryQuery,
  useRemoveHistoryEntryMutation,
  useClearHistoryMutation,
} from '../../history/historyApi';

const HistoryTabPanel = () => {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const isFirstPage = cursor === undefined;

  const { data, isLoading, isFetching, isError, refetch } = useGetHistoryQuery({
    limit: 20,
    ...(cursor !== undefined && { cursor }),
  });

  const [removeHistoryEntry] = useRemoveHistoryEntryMutation();
  const [clearHistory, { isLoading: isClearing }] = useClearHistoryMutation();

  const entries = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const handleLoadMore = () => {
    if (data?.meta.nextCursor) setCursor(data.meta.nextCursor);
  };

  const handleRemove = async (entry: IHistoryResponse) => {
    await removeHistoryEntry(entry.id).unwrap();
  };

  const handleClearAll = async () => {
    await clearHistory().unwrap();
    setClearConfirmOpen(false);
    setCursor(undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClearConfirmOpen(true)}
            className="text-text-secondary hover:text-error"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
            Clear all
          </Button>
        )}
      </div>

      <HistoryList
        entries={entries}
        isLoading={isLoading && isFirstPage}
        isFetchingNextPage={isFetching && !isFirstPage}
        hasNextPage={hasNextPage}
        onLoadMore={handleLoadMore}
        onRemove={handleRemove}
        onRetry={refetch}
        isError={isError}
      />

      <ConfirmModal
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleClearAll}
        intent="danger"
        title="Clear your watch history?"
        description="This removes every entry from your watch history. It won't delete the videos or shorts themselves. This action cannot be undone."
        confirmLabel="Clear all"
        isLoading={isClearing}
      />
    </div>
  );
};

export default HistoryTabPanel;
