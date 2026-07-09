import {
  PROVIDER_MEDIA_INDEX_TTL_SECONDS,
  type MultipartMediaType,
} from '@network/shared';
import { redisClient } from '../../config/redis.js';

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
