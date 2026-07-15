import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  IPostResponse,
  IShortResponse,
  IVideoResponse,
} from '@network/shared';
import { LOW_WATER_MARK, UNIFIED_FEED_PAGE_SIZE } from '@network/shared';
import { useLazyGetFeedQuery } from '../feedApi';
import { useLazySearchAllQuery } from '../../search/searchApi';
import type { FeedBlockType } from '../utils/scheduler';

export type MixedFeedSource =
  | { mode: 'global' }
  | { mode: 'search'; q: string };

export interface MixedFeedPools {
  video: IVideoResponse[];
  short: IShortResponse[];
  post: IPostResponse[];
}

type HasNextPageState = Record<FeedBlockType, boolean>;

interface CursorState {
  videoCursor?: string;
  shortCursor?: string;
  postCursor?: string;
}

const sourceKey = (source: MixedFeedSource): string =>
  source.mode === 'search' ? `search:${source.q}` : 'global';

export const useMixedFeedPools = (
  source: MixedFeedSource,
  limit: number = UNIFIED_FEED_PAGE_SIZE
) => {
  const [pools, setPools] = useState<MixedFeedPools>({
    video: [],
    short: [],
    post: [],
  });
  const [hasNextPage, setHasNextPage] = useState<HasNextPageState>({
    video: true,
    short: true,
    post: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const cursorsRef = useRef<CursorState>({});
  const isFetchingRef = useRef(false);
  const sourceKeyRef = useRef<string>('');

  const exhaustedRef = useRef<HasNextPageState>({
    video: false,
    short: false,
    post: false,
  });

  const [triggerFeed] = useLazyGetFeedQuery();
  const [triggerSearch] = useLazySearchAllQuery();

  const fetchNext = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingMore(true);

    try {
      const alreadyExhausted = exhaustedRef.current;
      const cursors = cursorsRef.current;
      const response =
        source.mode === 'search'
          ? await triggerSearch({ q: source.q, ...cursors, limit }).unwrap()
          : await triggerFeed({ ...cursors, limit }).unwrap();

      const batch = response.data;

      setPools((prev) => ({
        video: alreadyExhausted.video
          ? prev.video
          : [...prev.video, ...batch.video.data],
        short: alreadyExhausted.short
          ? prev.short
          : [...prev.short, ...batch.short.data],
        post: alreadyExhausted.post
          ? prev.post
          : [...prev.post, ...batch.post.data],
      }));

      const nowExhausted: HasNextPageState = {
        video: alreadyExhausted.video || !batch.video.meta.hasNextPage,
        short: alreadyExhausted.short || !batch.short.meta.hasNextPage,
        post: alreadyExhausted.post || !batch.post.meta.hasNextPage,
      };
      exhaustedRef.current = nowExhausted;

      setHasNextPage({
        video: !nowExhausted.video,
        short: !nowExhausted.short,
        post: !nowExhausted.post,
      });
      cursorsRef.current = {
        videoCursor: alreadyExhausted.video
          ? cursors.videoCursor
          : (batch.video.meta.nextCursor ?? undefined),
        shortCursor: alreadyExhausted.short
          ? cursors.shortCursor
          : (batch.short.meta.nextCursor ?? undefined),
        postCursor: alreadyExhausted.post
          ? cursors.postCursor
          : (batch.post.meta.nextCursor ?? undefined),
      };
      setIsError(false);
    } catch (_err) {
      setIsError(true);
    } finally {
      isFetchingRef.current = false;
      setIsFetchingMore(false);
      setIsLoading(false);
    }
  }, [source, limit, triggerFeed, triggerSearch]);

  useEffect(() => {
    const key = sourceKey(source);
    if (sourceKeyRef.current === key) return;
    sourceKeyRef.current = key;

    cursorsRef.current = {};
    exhaustedRef.current = { video: false, short: false, post: false };
    setPools({ video: [], short: [], post: [] });
    setHasNextPage({ video: true, short: true, post: true });
    setIsLoading(true);
    setIsError(false);
    fetchNext();
  }, [source]);

  const reportConsumed = useCallback(
    (consumed: Partial<Record<FeedBlockType, number>>) => {
      setPools((prev) => ({
        video: consumed.video ? prev.video.slice(consumed.video) : prev.video,
        short: consumed.short ? prev.short.slice(consumed.short) : prev.short,
        post: consumed.post ? prev.post.slice(consumed.post) : prev.post,
      }));
    },
    []
  );

  const restoreToPools = useCallback((restore: Partial<MixedFeedPools>) => {
    setPools((prev) => ({
      video: restore.video ? [...restore.video, ...prev.video] : prev.video,
      short: restore.short ? [...restore.short, ...prev.short] : prev.short,
      post: restore.post ? [...restore.post, ...prev.post] : prev.post,
    }));
  }, []);

  const ensureBuffer = useCallback(() => {
    if (isFetchingRef.current) return;
    const lowOnAny =
      (pools.video.length <= LOW_WATER_MARK && hasNextPage.video) ||
      (pools.short.length <= LOW_WATER_MARK && hasNextPage.short) ||
      (pools.post.length <= LOW_WATER_MARK && hasNextPage.post);
    if (lowOnAny) fetchNext();
  }, [pools, hasNextPage, fetchNext]);

  const isExhausted =
    !hasNextPage.video &&
    !hasNextPage.short &&
    !hasNextPage.post &&
    pools.video.length === 0 &&
    pools.short.length === 0 &&
    pools.post.length === 0;

  return {
    pools,
    hasNextPage,
    reportConsumed,
    restoreToPools,
    ensureBuffer,
    isLoading,
    isFetchingMore,
    isError,
    isExhausted,
    retry: fetchNext,
  };
};
