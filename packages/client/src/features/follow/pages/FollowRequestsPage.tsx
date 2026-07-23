import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import Spinner from '../../../shared/ui/primitives/Spinner';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import VideoEmptyState from '../../video/components/VideoEmptyState';
import VideoErrorState from '../../video/components/VideoErrorState';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import { useGetFollowRequestsQuery } from '../followApi';
import FollowRequestRow from '../components/FollowRequestRow';

const FollowRequestsPage = () => {
  usePageTitle('Follow requests');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const ownUsername = useAppSelector((state) => state.auth.user?.username);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetFollowRequestsQuery({
      limit: 20,
      ...(cursor !== undefined && { cursor }),
    });

  const items = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  return (
    <div className="mx-auto max-w-3xl">
      {ownUsername && (
        <Link
          to={buildProfilePath(ownUsername)}
          className="mb-4 mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary md:mt-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      )}

      <h1 className="mb-4 text-xl font-semibold font-display text-text-primary">
        Follow requests
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" className="text-text-muted" />
        </div>
      ) : isError && items.length === 0 ? (
        <VideoErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <VideoEmptyState
          message="No pending requests"
          subMessage="When someone requests to follow you, they'll appear here."
        />
      ) : (
        <InfiniteScroll
          isLoading={isFetching}
          hasMore={hasNextPage}
          onLoadMore={() => setCursor(data?.meta.nextCursor ?? undefined)}
        >
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <FollowRequestRow key={item.id} item={item} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default FollowRequestsPage;
