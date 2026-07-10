export interface FeedCursor {
  videoCursor: string | null;
  postCursor: string | null;
  seed: number;
  offset: number;
}

interface EncodedFeedCursor {
  v: string | null;
  p: string | null;
  s: number;
  o: number;
}

export const encodeFeedCursor = (cursor: FeedCursor): string => {
  const encoded: EncodedFeedCursor = {
    v: cursor.videoCursor,
    p: cursor.postCursor,
    s: cursor.seed,
    o: cursor.offset,
  };
  return Buffer.from(JSON.stringify(encoded), 'utf-8').toString('base64url');
};

export const decodeFeedCursor = (raw: string): FeedCursor | null => {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf-8')
    ) as EncodedFeedCursor;

    if (
      (parsed.v !== null && typeof parsed.v !== 'string') ||
      (parsed.p !== null && typeof parsed.p !== 'string') ||
      typeof parsed.s !== 'number' ||
      typeof parsed.o !== 'number'
    ) {
      return null;
    }

    return {
      videoCursor: parsed.v,
      postCursor: parsed.p,
      seed: parsed.s,
      offset: parsed.o,
    };
  } catch {
    return null;
  }
};

export const createInitialFeedCursor = (seed: number): FeedCursor => ({
  videoCursor: null,
  postCursor: null,
  seed,
  offset: 0,
});
