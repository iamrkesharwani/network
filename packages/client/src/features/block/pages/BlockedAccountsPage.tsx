import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import VideoEmptyState from '../../video/components/VideoEmptyState';
import VideoErrorState from '../../video/components/VideoErrorState';
import { useGetBlockedUsersQuery } from '../blockApi';
import BlockedUserRow from '../components/BlockedUserRow';

const BlockedAccountsPage = () => {
  usePageTitle('Blocked accounts');
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetBlockedUsersQuery({
      limit: 20,
      ...(cursor !== undefined && { cursor }),
    });

  const items = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={CLIENT_ROUTES.SETTINGS_PRIVACY}
        className="mb-4 mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary md:mt-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to privacy settings
      </Link>

      <h1 className="mb-4 text-xl font-semibold font-display text-text-primary">
        Blocked accounts
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" className="text-text-muted" />
        </div>
      ) : isError && items.length === 0 ? (
        <VideoErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <VideoEmptyState
          message="No blocked accounts"
          subMessage="Accounts you block will appear here so you can unblock them later."
        />
      ) : (
        <InfiniteScroll
          isLoading={isFetching}
          hasMore={hasNextPage}
          onLoadMore={() => setCursor(data?.meta.nextCursor ?? undefined)}
        >
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <BlockedUserRow key={item.id} item={item} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default BlockedAccountsPage;
