import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IHistoryResponse,
  IHistoryResumeResponse,
  HistoryFeedQuery,
  HistoryContentType,
} from '@network/shared';

export const historyApi = createApi({
  reducerPath: 'historyApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/history' }),
  tagTypes: ['History'],
  endpoints: (builder) => ({
    getHistory: builder.query<
      PaginatedResponse<IHistoryResponse>,
      HistoryFeedQuery
    >({
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
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) {
          byId.set(item.id, item);
        }
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['History'],
    }),

    getResume: builder.query<
      ApiResponse<IHistoryResumeResponse | null>,
      { contentType: HistoryContentType; contentId: string }
    >({
      query: ({ contentType, contentId }) => ({
        url: `/${contentType}/${contentId}/resume`,
        method: 'GET',
      }),
    }),

    removeHistoryEntry: builder.mutation<ApiResponse<null>, string>({
      query: (historyId) => ({
        url: `/${historyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['History'],
    }),

    clearHistory: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/',
        method: 'DELETE',
      }),
      invalidatesTags: ['History'],
    }),
  }),
});

export const {
  useGetHistoryQuery,
  useLazyGetResumeQuery,
  useRemoveHistoryEntryMutation,
  useClearHistoryMutation,
} = historyApi;
