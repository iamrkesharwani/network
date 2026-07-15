import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IMixedFeedBatch,
  IPostResponse,
  IPublicProfile,
  IShortResponse,
  IVideoResponse,
  PaginatedResponse,
  SearchType,
} from '@network/shared';

export interface SearchAllQueryArgs {
  q: string;
  videoCursor?: string;
  shortCursor?: string;
  postCursor?: string;
  limit: number;
}

export interface SearchByTypeQueryArgs {
  q: string;
  type: SearchType;
  cursor?: string;
  limit: number;
}

export interface SearchCreatorsQueryArgs {
  q: string;
  cursor?: string;
  limit: number;
}

type SearchByTypeItem = IVideoResponse | IShortResponse | IPostResponse;

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/search' }),
  endpoints: (builder) => ({
    searchAll: builder.query<ApiResponse<IMixedFeedBatch>, SearchAllQueryArgs>({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
    }),
    searchByType: builder.query<
      PaginatedResponse<SearchByTypeItem>,
      SearchByTypeQueryArgs
    >({
      query: ({ type, ...params }) => ({
        url: `/${type}`,
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.type}-${queryArgs.q}`,
      merge: (currentCache, newData, { arg }) => {
        if (arg.cursor === undefined) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) {
          byId.set(item.id, item);
        }
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
    }),
    searchCreators: builder.query<
      PaginatedResponse<IPublicProfile>,
      SearchCreatorsQueryArgs
    >({
      query: (params) => ({
        url: '/creators',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.q}`,
      merge: (currentCache, newData, { arg }) => {
        if (arg.cursor === undefined) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) {
          byId.set(item.id, item);
        }
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
    }),
  }),
});

export const {
  useLazySearchAllQuery,
  useSearchByTypeQuery,
  useSearchCreatorsQuery,
} = searchApi;
