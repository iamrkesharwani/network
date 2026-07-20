import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type { ApiResponse, ContentType, IShareResponse } from '@network/shared';

export const shareApi = createApi({
  reducerPath: 'shareApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/share' }),
  endpoints: (builder) => ({
    createShare: builder.mutation<
      ApiResponse<IShareResponse>,
      { contentType: ContentType; contentId: string }
    >({
      query: (data) => ({
        url: '/',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const { useCreateShareMutation } = shareApi;
