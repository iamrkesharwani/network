import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { IFollowListItem } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import VideoEmptyState from '../../video/components/VideoEmptyState';
import VideoErrorState from '../../video/components/VideoErrorState';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useRemoveFollowerMutation,
} from '../followApi';
import FollowListItemRow from '../components/FollowListItemRow';

const getMode = (pathname: string): 'followers' | 'following' =>
  pathname.endsWith('/following') ? 'following' : 'followers';

const FollowListPage = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const mode = getMode(location.pathname);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [pendingRemoval, setPendingRemoval] = useState<IFollowListItem | null>(
    null
  );

  const ownUsername = useAppSelector((state) => state.auth.user?.username);
  const isOwnFollowersList =
    mode === 'followers' && !!ownUsername && ownUsername === username;

  const useListQuery =
    mode === 'followers' ? useGetFollowersQuery : useGetFollowingQuery;

  const { data, isLoading, isFetching, isError, refetch } = useListQuery(
    { username: username ?? '', limit: 20, ...(cursor !== undefined && { cursor }) },
    { skip: !username }
  );

  const [removeFollower, { isLoading: isRemoving }] =
    useRemoveFollowerMutation();

  const handleConfirmRemove = async () => {
    if (!pendingRemoval || !ownUsername) return;
    try {
      await removeFollower({
        username: pendingRemoval.username,
        ownUsername,
      }).unwrap();
    } finally {
      setPendingRemoval(null);
    }
  };

  usePageTitle(mode === 'followers' ? 'Followers' : 'Following');

  const items = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  if (!username) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={buildProfilePath(username)}
        className="mb-4 mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary md:mt-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>

      <h1 className="mb-4 text-xl font-semibold font-display text-text-primary">
        {mode === 'followers' ? 'Followers' : 'Following'}
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" className="text-text-muted" />
        </div>
      ) : isError && items.length === 0 ? (
        <VideoErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <VideoEmptyState
          message={mode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          subMessage={
            mode === 'followers'
              ? "When people follow this account they'll appear here."
              : "Accounts this user follows will appear here."
          }
        />
      ) : (
        <InfiniteScroll
          isLoading={isFetching}
          hasMore={hasNextPage}
          onLoadMore={() => setCursor(data?.meta.nextCursor ?? undefined)}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item) => (
              <FollowListItemRow
                key={item.id}
                item={item}
                canRemove={isOwnFollowersList}
                onRemove={setPendingRemoval}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}

      <ConfirmModal
        isOpen={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        onConfirm={handleConfirmRemove}
        title="Remove follower?"
        description={`${pendingRemoval?.name ?? 'This person'} will no longer follow you. They can follow you again later.`}
        confirmLabel="Remove"
        intent="danger"
        isLoading={isRemoving}
      />
    </div>
  );
};

export default FollowListPage;
