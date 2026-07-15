import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  IPostResponse,
  IShortResponse,
  IVideoResponse,
} from '@network/shared';
import { CLIENT_ROUTES, SKIP_GUARD } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { COL_CLASS } from '../../video/utils/videoGrid';
import { SHORT_COL_CLASS } from '../../short/utils/shortGrid';
import VideoCard from '../../video/pages/VideoCard';
import ShortRailCard from '../../short/components/ShortRailCard';
import ShortTheaterModal from '../../short/components/ShortTheaterModal';
import VideoErrorState from '../../video/components/VideoErrorState';
import VideoEmptyState from '../../video/components/VideoEmptyState';
import PostGridTile from '../../post/pages/PostGridTile';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import FeedSkeleton from '../skeleton/FeedSkeleton';
import { useFeedColumns, type FeedColumnCount } from '../hooks/useFeedColumns';
import {
  useMixedFeedPools,
  type MixedFeedSource,
} from '../hooks/useMixedFeedPools';
import { createScheduler, type FeedBlockType } from '../utils/scheduler';

export type { MixedFeedSource };

type FeedRenderBlock =
  | { type: 'video'; items: IVideoResponse[] }
  | { type: 'short'; items: IShortResponse[] }
  | { type: 'post'; items: IPostResponse[] };

export interface FeedRendererProps {
  source: MixedFeedSource;
  emptyMessage?: string;
  emptySubMessage?: string;
}

const WIDTH_MODE_CLASS = {
  full: '',
  edge: '-mx-4 sm:-mx-6 lg:-mx-8',
} as const;

const FeedRenderer = ({
  source,
  emptyMessage = 'Nothing here yet',
  emptySubMessage = 'When content is added it will appear here.',
}: FeedRendererProps) => {
  const navigate = useNavigate();
  const isMobileLayout = useIsMobileLayout();
  const {
    columns,
    widthMode,
    firstVideoBlockSize,
    videosPerBlock,
    shortsPerBlock,
    postsPerBlock,
  } = useFeedColumns(false);

  const {
    pools,
    hasNextPage,
    reportConsumed,
    restoreToPools,
    ensureBuffer,
    isLoading,
    isFetchingMore,
    isError,
    isExhausted,
    retry,
  } = useMixedFeedPools(source);

  const [blocks, setBlocks] = useState<FeedRenderBlock[]>([]);
  const [theaterIndex, setTheaterIndex] = useState<number | null>(null);
  const schedulerRef = useRef(createScheduler());
  const isFirstVideoBlockRef = useRef(true);

  const sourceKey = source.mode === 'search' ? `search:${source.q}` : 'global';
  const prevSourceKeyRef = useRef(sourceKey);
  let resetForSource = false;
  if (prevSourceKeyRef.current !== sourceKey) {
    prevSourceKeyRef.current = sourceKey;
    schedulerRef.current = createScheduler();
    isFirstVideoBlockRef.current = true;
    if (blocks.length > 0) setBlocks([]);
    resetForSource = true;
  }

  const sizeKey = `${firstVideoBlockSize}-${videosPerBlock}-${shortsPerBlock}-${postsPerBlock}`;
  const prevSizeKeyRef = useRef(sizeKey);
  if (!resetForSource && prevSizeKeyRef.current !== sizeKey) {
    prevSizeKeyRef.current = sizeKey;
    if (blocks.length > 0) {
      const restore: {
        video: IVideoResponse[];
        short: IShortResponse[];
        post: IPostResponse[];
      } = {
        video: [],
        short: [],
        post: [],
      };
      for (const block of blocks) {
        if (block.type === 'video') restore.video.push(...block.items);
        else if (block.type === 'short') restore.short.push(...block.items);
        else restore.post.push(...block.items);
      }
      restoreToPools(restore);
      setBlocks([]);
    }
    schedulerRef.current = createScheduler();
    isFirstVideoBlockRef.current = true;
  } else {
    prevSizeKeyRef.current = sizeKey;
  }

  useEffect(() => {
    if (isLoading) return;

    const videoPool = pools.video.slice();
    const shortPool = pools.short.slice();
    const postPool = pools.post.slice();
    const consumed = { video: 0, short: 0, post: 0 };
    const newBlocks: FeedRenderBlock[] = [];
    let skipStreak = 0;
    const unavailable = new Set<FeedBlockType>();

    const blockSize = (type: FeedBlockType): number => {
      if (type === 'video') {
        return isFirstVideoBlockRef.current
          ? firstVideoBlockSize
          : videosPerBlock;
      }
      return type === 'short' ? shortsPerBlock : postsPerBlock;
    };

    while (skipStreak < SKIP_GUARD) {
      const type = schedulerRef.current(unavailable);
      if (type === null) break;

      const size = blockSize(type);
      const pool =
        type === 'video' ? videoPool : type === 'short' ? shortPool : postPool;
      const stillMore = hasNextPage[type];

      if (pool.length < size && stillMore) {
        skipStreak++;
        unavailable.add(type);
        continue;
      }

      const take = stillMore ? size : Math.min(size, pool.length);
      if (take === 0) {
        skipStreak++;
        unavailable.add(type);
        continue;
      }

      const items = pool.splice(0, take);
      consumed[type] += items.length;
      if (type === 'video') {
        newBlocks.push({ type: 'video', items: items as IVideoResponse[] });
        isFirstVideoBlockRef.current = false;
      } else if (type === 'short') {
        newBlocks.push({ type: 'short', items: items as IShortResponse[] });
      } else {
        newBlocks.push({ type: 'post', items: items as IPostResponse[] });
      }
      skipStreak = 0;
    }

    if (newBlocks.length > 0) {
      reportConsumed(consumed);
      setBlocks((prev) => [...prev, ...newBlocks]);
    }
  }, [
    pools,
    hasNextPage,
    isLoading,
    firstVideoBlockSize,
    videosPerBlock,
    shortsPerBlock,
    postsPerBlock,
  ]);

  const allShorts = useMemo(
    () =>
      blocks
        .filter(
          (block): block is Extract<FeedRenderBlock, { type: 'short' }> =>
            block.type === 'short'
        )
        .flatMap((block) => block.items),
    [blocks]
  );

  const handleShortClick = (short: IShortResponse) => {
    if (isMobileLayout) {
      navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id));
      return;
    }
    const index = allShorts.findIndex((s) => s.id === short.id);
    if (index === -1) return;
    setTheaterIndex(index);
  };

  const handleTheaterNext = () => {
    setTheaterIndex((index) =>
      index === null ? index : Math.min(index + 1, allShorts.length - 1)
    );
  };

  const handleTheaterPrev = () => {
    setTheaterIndex((index) =>
      index === null ? index : Math.max(index - 1, 0)
    );
  };

  if (isLoading && blocks.length === 0) {
    return (
      <div className={cn(WIDTH_MODE_CLASS[widthMode])}>
        <FeedSkeleton
          columns={columns}
          firstVideoBlockSize={firstVideoBlockSize}
          videosPerBlock={videosPerBlock}
          shortsPerBlock={shortsPerBlock}
          postsPerBlock={postsPerBlock}
        />
      </div>
    );
  }

  if (isError && blocks.length === 0) {
    return <VideoErrorState onRetry={retry} />;
  }

  if (blocks.length === 0 && isExhausted) {
    return (
      <VideoEmptyState message={emptyMessage} subMessage={emptySubMessage} />
    );
  }

  return (
    <div className={cn(WIDTH_MODE_CLASS[widthMode])}>
      <InfiniteScroll
        isLoading={isFetchingMore}
        hasMore={!isExhausted}
        onLoadMore={ensureBuffer}
      >
        <div className="flex flex-col gap-8">
          {blocks.map((block, blockIdx) => {
            if (block.type === 'video') {
              return (
                <div
                  key={`video-${blockIdx}`}
                  className={`grid gap-4 ${COL_CLASS[columns]}`}
                >
                  {block.items.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              );
            }

            if (block.type === 'short') {
              return (
                <div
                  key={`short-${blockIdx}`}
                  className={`grid gap-4 ${SHORT_COL_CLASS[shortsPerBlock]}`}
                >
                  {block.items.map((short) => (
                    <ShortRailCard
                      key={short.id}
                      short={short}
                      onClick={handleShortClick}
                    />
                  ))}
                </div>
              );
            }

            return (
              <div
                key={`post-${blockIdx}`}
                className={`grid gap-4 ${COL_CLASS[postsPerBlock as FeedColumnCount]}`}
              >
                {block.items.map((post) => (
                  <PostGridTile key={post.id} post={post} />
                ))}
              </div>
            );
          })}
        </div>
      </InfiniteScroll>

      {theaterIndex !== null && (
        <ShortTheaterModal
          short={allShorts[theaterIndex] ?? null}
          activeIndex={theaterIndex}
          total={allShorts.length}
          onNext={handleTheaterNext}
          onPrev={handleTheaterPrev}
          onClose={() => setTheaterIndex(null)}
        />
      )}
    </div>
  );
};

export default FeedRenderer;
