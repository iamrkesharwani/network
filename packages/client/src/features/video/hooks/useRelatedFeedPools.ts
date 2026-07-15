import { useCallback, useEffect, useRef, useState } from 'react';
import type { IShortResponse, IVideoResponse } from '@network/shared';
import { RELATED_FEED_PAGE_SIZE } from '@network/shared';
import { useLazyGetRelatedQuery } from '../videoApi';

export interface RelatedFeedPools {
  video: IVideoResponse[];
  short: IShortResponse[];
}

type RelatedBlockType = 'video' | 'short';
type HasNextPageState = Record<RelatedBlockType, boolean>;

interface CursorState {
  videoCursor?: string;
  shortCursor?: string;
}

export const useRelatedFeedPools = (
  videoId: string,
  limit: number = RELATED_FEED_PAGE_SIZE
) => {
  const [pools, setPools] = useState<RelatedFeedPools>({
    video: [],
    short: [],
  });
  const [hasNextPage, setHasNextPage] = useState<HasNextPageState>({
    video: true,
    short: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const cursorsRef = useRef<CursorState>({});
  const isFetchingRef = useRef(false);
  const videoIdRef = useRef<string>('');
  const seenIdsRef = useRef<Set<string>>(new Set());

  const exhaustedRef = useRef<HasNextPageState>({
    video: false,
    short: false,
  });

  const [triggerRelated] = useLazyGetRelatedQuery();

  const dedupe = useCallback(
    <T extends { id: string }>(items: T[]): T[] =>
      items.filter((item) => {
        if (seenIdsRef.current.has(item.id)) return false;
        seenIdsRef.current.add(item.id);
        return true;
      }),
    []
  );

  const fetchNext = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingMore(true);

    try {
      const alreadyExhausted = exhaustedRef.current;
      const cursors = cursorsRef.current;
      const response = await triggerRelated({
        videoId,
        ...cursors,
        limit,
      }).unwrap();
      const batch = response.data;

      setPools((prev) => ({
        video: alreadyExhausted.video
          ? prev.video
          : [...prev.video, ...dedupe(batch.video.data)],
        short: alreadyExhausted.short
          ? prev.short
          : [...prev.short, ...dedupe(batch.short.data)],
      }));

      const nowExhausted: HasNextPageState = {
        video: alreadyExhausted.video || !batch.video.meta.hasNextPage,
        short: alreadyExhausted.short || !batch.short.meta.hasNextPage,
      };
      exhaustedRef.current = nowExhausted;

      setHasNextPage({
        video: !nowExhausted.video,
        short: !nowExhausted.short,
      });
      cursorsRef.current = {
        videoCursor: alreadyExhausted.video
          ? cursors.videoCursor
          : (batch.video.meta.nextCursor ?? undefined),
        shortCursor: alreadyExhausted.short
          ? cursors.shortCursor
          : (batch.short.meta.nextCursor ?? undefined),
      };
      setIsError(false);
    } catch (_err) {
      setIsError(true);
    } finally {
      isFetchingRef.current = false;
      setIsFetchingMore(false);
      setIsLoading(false);
    }
  }, [videoId, limit, triggerRelated, dedupe]);

  useEffect(() => {
    if (videoIdRef.current === videoId) return;
    videoIdRef.current = videoId;

    cursorsRef.current = {};
    exhaustedRef.current = { video: false, short: false };
    seenIdsRef.current = new Set();
    setPools({ video: [], short: [] });
    setHasNextPage({ video: true, short: true });
    setIsLoading(true);
    setIsError(false);
    fetchNext();
  }, [videoId, fetchNext]);

  const ensureBuffer = useCallback(() => {
    if (isFetchingRef.current) return;
    const lowOnAny =
      (pools.video.length === 0 && hasNextPage.video) ||
      (pools.short.length === 0 && hasNextPage.short);
    if (lowOnAny) fetchNext();
  }, [pools, hasNextPage, fetchNext]);

  const isExhausted =
    !hasNextPage.video &&
    !hasNextPage.short &&
    pools.video.length === 0 &&
    pools.short.length === 0;

  return {
    pools,
    hasNextPage,
    ensureBuffer,
    isLoading,
    isFetchingMore,
    isError,
    isExhausted,
    retry: fetchNext,
    fetchNext,
  };
};
