import { CLIENT_ROUTES, type ContentType, type IShareResponse } from '@network/shared';
import * as shareRepository from './share.repository.js';
import { getModerationContentAdapter } from '../../core/moderation/moderationContent.registry.js';
import { getContentCounterAdapter } from '../../core/contentRef/contentCounter.registry.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { env } from '../../core/env/env.js';

const WATCH_ROUTE_BY_TYPE: Record<ContentType, string> = {
  post: CLIENT_ROUTES.POST_WATCH,
  video: CLIENT_ROUTES.VIDEO_WATCH,
  short: CLIENT_ROUTES.SHORT_WATCH,
};

const WATCH_PARAM_BY_TYPE: Record<ContentType, string> = {
  post: ':postId',
  video: ':videoId',
  short: ':shortId',
};

export const createShare = async (
  sharerId: string | null,
  contentType: ContentType,
  contentId: string
): Promise<IShareResponse> => {
  const moderationAdapter = getModerationContentAdapter(contentType);
  if (!moderationAdapter) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `Sharing ${contentType} content is not available yet.`
    );
  }

  const { exists } = await moderationAdapter.lookup(contentId);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Content not found.');
  }

  const { ref } = await shareRepository.create(sharerId, contentType, contentId);

  const counterAdapter = getContentCounterAdapter(contentType);
  if (counterAdapter?.incrementShares) {
    await counterAdapter.incrementShares(contentId);
  }

  const path = WATCH_ROUTE_BY_TYPE[contentType].replace(
    WATCH_PARAM_BY_TYPE[contentType],
    contentId
  );
  const url = `${env.CLIENT_URL}${path}?ref=${ref}`;

  return { url, ref };
};
