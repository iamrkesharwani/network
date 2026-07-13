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
        const byId = new Map(
          currentCache.data.map((entry) => [entry.item.id, entry])
        );
        for (const entry of newData.data) {
          byId.set(entry.item.id, entry);
        }
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['UnifiedFeed'],
    }),
  }),
});

export const { useGetFeedQuery } = feedApi;
