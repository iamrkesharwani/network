import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IVideoResponse,
  IVideoActionResult,
  IInitiateVideoUploadResult,
  InitiateVideoUploadInput,
  ConfirmVideoUploadInput,
  VideoUploadInput,
  VideoUpdateInput,
  VideoFeedQuery,
} from '@network/shared';

export const videoApi = createApi({
  reducerPath: 'videoApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/video' }),
  tagTypes: ['Video', 'MyVideos'],
  endpoints: (builder) => ({
    initiateUpload: builder.mutation<
      ApiResponse<IInitiateVideoUploadResult>,
      InitiateVideoUploadInput
    >({
      query: (data) => ({
        url: '/initiate-upload',
        method: 'POST',
        data,
      }),
    }),

    confirmUpload: builder.mutation<
      ApiResponse<IVideoActionResult>,
      ConfirmVideoUploadInput
    >({
      query: (data) => ({
        url: '/confirm-upload',
        method: 'POST',
        data,
      }),
    }),

    uploadThumbnail: builder.mutation<
      ApiResponse<{ thumbnailUrl: string }>,
      FormData
    >({
      query: (data) => ({
        url: '/thumbnail',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),

    finaliseVideo: builder.mutation<
      ApiResponse<IVideoActionResult>,
      { videoId: string } & VideoUploadInput
    >({
      query: ({ videoId, ...data }) => ({
        url: `/${videoId}/finalise`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['MyVideos'],
    }),

    getFeed: builder.query<PaginatedResponse<IVideoResponse>, VideoFeedQuery>({
      query: (params) => ({
        url: '/feed',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newData, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const existingIds = new Set(currentCache.data.map((item) => item.id));
        for (const item of newData.data) {
          if (!existingIds.has(item.id)) {
            currentCache.data.push(item);
          }
        }
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: ['Video'],
    }),

    getMyVideos: builder.query<
      PaginatedResponse<IVideoResponse>,
      VideoFeedQuery
    >({
      query: (params) => ({
        url: '/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['MyVideos'],
    }),

    getVideoById: builder.query<ApiResponse<IVideoResponse>, string>({
      query: (videoId) => ({
        url: `/${videoId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, videoId) => [
        { type: 'Video', id: videoId },
      ],
    }),

    updateVideo: builder.mutation<
      ApiResponse<IVideoResponse>,
      { videoId: string } & VideoUpdateInput
    >({
      query: ({ videoId, ...data }) => ({
        url: `/${videoId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_result, _error, { videoId }) => [
        { type: 'Video', id: videoId },
        'MyVideos',
      ],
    }),

    deleteVideo: builder.mutation<ApiResponse<null>, string>({
      query: (videoId) => ({
        url: `/${videoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, videoId) => [
        { type: 'Video', id: videoId },
        'MyVideos',
        'Video',
      ],
    }),
  }),
});

export const {
  useInitiateUploadMutation,
  useConfirmUploadMutation,
  useUploadThumbnailMutation,
  useFinaliseVideoMutation,
  useGetFeedQuery,
  useGetMyVideosQuery,
  useGetVideoByIdQuery,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} = videoApi;
