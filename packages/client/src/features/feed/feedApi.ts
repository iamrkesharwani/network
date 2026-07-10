import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  PaginatedResponse,
  IFeedItem,
  UnifiedFeedQuery,
} from '@network/shared';

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/feed' }),
  tagTypes: ['UnifiedFeed'],
  endpoints: (builder) => ({
    getFeed: builder.query<PaginatedResponse<IFeedItem>, UnifiedFeedQuery>({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newData, { arg }) => {
        if (arg.cursor === undefined) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const existingIds = new Set(
          currentCache.data.map((entry) => entry.item.id)
        );
        for (const entry of newData.data) {
          if (!existingIds.has(entry.item.id)) {
            currentCache.data.push(entry);
          }
        }
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['UnifiedFeed'],
    }),
  }),
});

export const { useGetFeedQuery } = feedApi;
