import type {
  BookmarkableContentType,
  IBookmarkResponse,
  IBookmarkToggleResponse,
  PaginatedResponse,
} from '@network/shared';
import * as bookmarkRepository from './bookmark.repository.js';
import { getModerationContentAdapter } from '../../core/moderation/moderationContent.registry.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { toResponse } from './bookmark.mappers.js';

export const toggleBookmark = async (
  userId: string,
  contentType: BookmarkableContentType,
  contentId: string
): Promise<IBookmarkToggleResponse> => {
  const moderationAdapter = getModerationContentAdapter(contentType);
  if (!moderationAdapter) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `Saving ${contentType} content is not available yet.`
    );
  }

  const { exists } = await moderationAdapter.lookup(contentId);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Content not found.');
  }

  const { bookmarked } = await bookmarkRepository.toggle(
    userId,
    contentType,
    contentId
  );

  return { bookmarked };
};

export const getBookmarkStatuses = async (
  userId: string,
  contentType: BookmarkableContentType,
  contentIds: string[]
): Promise<Record<string, boolean>> => {
  const bookmarkedSet = await bookmarkRepository.getUserBookmarkedSet(
    userId,
    contentType,
    contentIds
  );

  const result: Record<string, boolean> = {};
  for (const id of contentIds) {
    result[id] = bookmarkedSet.has(id);
  }
  return result;
};

export const getBookmarks = async (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IBookmarkResponse>, 'success' | 'message'>> => {
  const { data, meta } = await bookmarkRepository.findByUserPaginated(
    userId,
    cursor,
    limit
  );

  return {
    data: data.map(toResponse).filter((item) => item !== null),
    meta,
  };
};
