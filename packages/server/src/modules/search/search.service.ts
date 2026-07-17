import type {
  IMixedFeedBatch,
  IPostResponse,
  IPublicProfile,
  ISearchSuggestions,
  IShortResponse,
  IVideoResponse,
  PaginatedResponse,
  SearchType,
} from '@network/shared';
import {
  SEARCH_SUGGESTION_LIMITS,
  TYPESENSE_COLLECTIONS,
} from '@network/shared';
import { ApiError } from '../../core/utils/ApiError.js';
import { typesenseClient } from '../../core/config/typesense.js';
import { composeMixedBatch, type MixCursors } from '../feed/mix.service.js';
import * as videoCrudService from '../video/services/video.crud.service.js';
import * as shortCrudService from '../short/services/short.crud.service.js';
import * as postCrudService from '../post/services/post.crud.service.js';
import * as userRepository from '../user/user.repository.js';
import type { IUserDocument } from '../user/user.model.js';

const requireQuery = (q: string): string => {
  const trimmed = q.trim();
  if (!trimmed) {
    throw new ApiError(400, 'BAD_REQUEST', 'Search query cannot be empty.');
  }
  return trimmed;
};

const toPublicProfile = (user: IUserDocument): IPublicProfile => ({
  id: user._id.toString(),
  username: user.username,
  name: user.name,
  ...(user.bio && { bio: user.bio }),
  ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
});

const queryTypesenseIds = async (
  collection: string,
  q: string,
  queryBy: string,
  limit: number
): Promise<string[]> => {
  const result = await typesenseClient
    .collections<{ id: string }>(collection)
    .documents()
    .search({
      q,
      query_by: queryBy,
      num_typos: 1,
      per_page: limit,
    });
  return (result.hits ?? []).map((hit) => hit.document.id);
};

const orderById = <T extends { id: string }>(
  items: T[],
  orderedIds: string[]
): T[] => {
  const byId = new Map(items.map((item) => [item.id, item]));
  return orderedIds
    .map((id) => byId.get(id))
    .filter((item): item is T => item !== undefined);
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
    data: result.data.map(toPublicProfile),
  };
};

export const searchSuggestions = async (
  q: string
): Promise<ISearchSuggestions> => {
  const query = requireQuery(q);

  const [creatorIds, videoIds, shortIds, postIds] = await Promise.all([
    queryTypesenseIds(
      TYPESENSE_COLLECTIONS.USER,
      query,
      'username,name',
      SEARCH_SUGGESTION_LIMITS.creator
    ),
    queryTypesenseIds(
      TYPESENSE_COLLECTIONS.VIDEO,
      query,
      'title,description,tags',
      SEARCH_SUGGESTION_LIMITS.video
    ),
    queryTypesenseIds(
      TYPESENSE_COLLECTIONS.SHORT,
      query,
      'title,description,tags',
      SEARCH_SUGGESTION_LIMITS.short
    ),
    queryTypesenseIds(
      TYPESENSE_COLLECTIONS.POST,
      query,
      'text,tags',
      SEARCH_SUGGESTION_LIMITS.post
    ),
  ]);

  const [creators, videos, shorts, posts] = await Promise.all([
    userRepository.findByIds(creatorIds),
    videoCrudService.findByIds(videoIds),
    shortCrudService.findByIds(shortIds),
    postCrudService.findByIds(postIds),
  ]);

  return {
    creators: orderById(creators.map(toPublicProfile), creatorIds),
    videos: orderById(videos, videoIds),
    shorts: orderById(shorts, shortIds),
    posts: orderById(posts, postIds),
  };
};
