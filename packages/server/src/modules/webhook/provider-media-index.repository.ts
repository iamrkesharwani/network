import type { MultipartMediaType } from '@network/shared';
import { redisClient } from '../../config/redis.js';

// Maps a provider's videoId back to which of our media types (video/short/
// post) owns it, so an incoming webhook can be routed to the right module in
// one query instead of probing video -> short -> post sequentially on every
// event. Generous TTL because processing can occasionally take a while and
// providers keep retrying webhooks for the same asset; entries are refreshed
// on every hit. If an entry is missing or has expired, the webhook handler
// falls back to the sequential probe and self-heals the index, so a stale or
// missing mapping never causes a webhook to be dropped — it's a cache, not a
// source of truth.
const PROVIDER_MEDIA_INDEX_TTL_SECONDS = 30 * 24 * 60 * 60;

const providerMediaIndexKey = (providerVideoId: string): string =>
  `provider-video:${providerVideoId}`;

export const setProviderMediaType = async (
  providerVideoId: string,
  mediaType: MultipartMediaType
): Promise<void> => {
  await redisClient.set(
    providerMediaIndexKey(providerVideoId),
    mediaType,
    'EX',
    PROVIDER_MEDIA_INDEX_TTL_SECONDS
  );
};

export const getProviderMediaType = async (
  providerVideoId: string
): Promise<MultipartMediaType | null> => {
  const value = await redisClient.get(providerMediaIndexKey(providerVideoId));
  return value as MultipartMediaType | null;
};
