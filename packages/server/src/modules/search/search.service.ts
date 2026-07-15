import type {
  IMixedFeedBatch,
  IPostResponse,
  IPublicProfile,
  IShortResponse,
  IVideoResponse,
  PaginatedResponse,
  SearchType,
} from '@network/shared';
import { ApiError } from '../../core/utils/ApiError.js';
import { composeMixedBatch, type MixCursors } from '../feed/mix.service.js';
import * as videoCrudService from '../video/services/video.crud.service.js';
import * as shortCrudService from '../short/services/short.crud.service.js';
import * as postCrudService from '../post/services/post.crud.service.js';
import * as userRepository from '../user/user.repository.js';

const requireQuery = (q: string): string => {
  const trimmed = q.trim();
  if (!trimmed) {
    throw new ApiError(400, 'BAD_REQUEST', 'Search query cannot be empty.');
  }
  return trimmed;
};

export const searchAll = async (
  q: string,
  cursors: MixCursors,
  limit: number
): Promise<IMixedFeedBatch> =>
  composeMixedBatch(cursors, limit, { mode: 'search', q: requireQuery(q) });

type SearchByTypeItem = IVideoResponse | IShortResponse | IPostResponse;
type SearchByTypeResult = Omit<
  PaginatedResponse<SearchByTypeItem>,
  'success' | 'message'
>;

export const searchByType = (
  q: string,
  type: SearchType,
  cursor: string | null,
  limit: number
): Promise<SearchByTypeResult> => {
  const query = requireQuery(q);

  switch (type) {
    case 'video':
      return videoCrudService.searchPublic(query, cursor, limit);
    case 'short':
      return shortCrudService.searchPublic(query, cursor, limit);
    case 'post':
      return postCrudService.searchPublic(query, cursor, limit);
  }
};

export const searchCreators = async (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IPublicProfile>, 'success' | 'message'>> => {
  const result = await userRepository.searchUsers(
    requireQuery(q),
    cursor,
    limit
  );

  return {
    ...result,
    data: result.data.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      ...(user.bio && { bio: user.bio }),
      ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
    })),
  };
};
