import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type { ApiResponse, IMixedFeedBatch } from '@network/shared';

export interface MixedFeedQueryArgs {
  videoCursor?: string;
  shortCursor?: string;
  postCursor?: string;
  limit: number;
}

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/feed' }),
  endpoints: (builder) => ({
    getFeed: builder.query<ApiResponse<IMixedFeedBatch>, MixedFeedQueryArgs>({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const { useLazyGetFeedQuery } = feedApi;
