import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  ConfirmShortUploadInput,
  IInitiateShortUploadResult,
  InitiateShortUploadInput,
  IShortResponse,
  PaginatedResponse,
  ShortFeedQuery,
  ShortUpdateInput,
  ShortUploadInput,
} from '@network/shared';

export const shortApi = createApi({
  reducerPath: 'shortApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/short' }),
  tagTypes: ['Short', 'MyShorts'],
  endpoints: (builder) => ({
    initiateUpload: builder.mutation<
      ApiResponse<IInitiateShortUploadResult>,
      InitiateShortUploadInput
    >({
      query: (data) => ({
        url: '/initiate-upload',
        method: 'POST',
        data,
      }),
    }),

    confirmUpload: builder.mutation<
      ApiResponse<IShortResponse>,
      ConfirmShortUploadInput
    >({
      query: (data) => ({
        url: '/confirm-upload',
        method: 'POST',
        data,
      }),
    }),

    finaliseShort: builder.mutation<
      ApiResponse<IShortResponse>,
      { shortId: string } & ShortUploadInput
    >({
      query: (data) => ({
        url: `${data.shortId}/finalise`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['MyShorts'],
    }),

    getFeed: builder.query<PaginatedResponse<IShortResponse>, ShortFeedQuery>({
      query: (params) => ({
        url: '/feed',
        method: 'GET',
        params,
      }),
      providesTags: ['Short'],
    }),

    getMyShorts: builder.query<
      PaginatedResponse<IShortResponse>,
      ShortFeedQuery
    >({
      query: (params) => ({
        url: '/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['Short'],
    }),

    getShortById: builder.query<ApiResponse<IShortResponse>, string>({
      query: (shortId) => ({
        url: `/${shortId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, shortId) => [
        { type: 'Short', id: shortId },
      ],
    }),

    updateShort: builder.mutation<
      ApiResponse<IShortResponse>,
      { shortId: string } & ShortUpdateInput
    >({
      query: ({ shortId, ...data }) => ({
        url: `/${shortId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_result, _error, { shortId }) => [
        { type: 'Short', id: shortId },
        'MyShorts',
      ],
    }),

    deleteShort: builder.mutation<ApiResponse<null>, string>({
      query: (shortId) => ({
        url: `/${shortId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, shortId) => [
        { type: 'Short', id: shortId },
        'MyShorts',
        'Short',
      ],
    }),
  }),
});

export const {
  useInitiateUploadMutation,
  useConfirmUploadMutation,
  useFinaliseShortMutation,
  useGetFeedQuery,
  useGetMyShortsQuery,
  useGetShortByIdQuery,
  useUpdateShortMutation,
  useDeleteShortMutation,
} = shortApi;
