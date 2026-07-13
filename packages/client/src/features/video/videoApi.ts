import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IVideoResponse,
  IVideoActionResult,
  IVisibilityCounts,
  IInitiateVideoUploadResult,
  InitiateVideoUploadInput,
  ConfirmVideoUploadInput,
  VideoUploadInput,
  VideoUpdateInput,
  VideoFeedQuery,
  VideoUserFeedQuery,
} from '@network/shared';

export const videoApi = createApi({
  reducerPath: 'videoApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/video' }),
  tagTypes: ['Video', 'MyVideos', 'UserVideos', 'UserVideoVisibilityCounts'],
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
      invalidatesTags: ['MyVideos', 'UserVideoVisibilityCounts'],
    }),

    getFeed: builder.query<PaginatedResponse<IVideoResponse>, VideoFeedQuery>({
      query: (params) => ({
        url: '/feed',
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

    getUserVideos: builder.query<
      PaginatedResponse<IVideoResponse>,
      { username: string } & VideoUserFeedQuery
    >({
      query: ({ username, ...params }) => ({
        url: `/user/${username}`,
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.username}-${queryArgs.visibility ?? 'all'}`,
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
      providesTags: ['UserVideos'],
    }),

    getUserVisibilityCounts: builder.query<ApiResponse<IVisibilityCounts>, string>({
      query: (username) => ({
        url: `/user/${username}/visibility-counts`,
        method: 'GET',
      }),
      providesTags: (_result, _error, username) => [
        { type: 'UserVideoVisibilityCounts', id: username },
      ],
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
        'UserVideos',
        'UserVideoVisibilityCounts',
      ],
      async onQueryStarted({ videoId }, { dispatch, getState, queryFulfilled }) {
        const { data: result } = await queryFulfilled.catch(() => ({
          data: undefined,
        }));
        if (!result) return;
        const updated = result.data;

        dispatch(
          videoApi.util.updateQueryData('getVideoById', videoId, (draft) => {
            Object.assign(draft.data, updated);
          })
        );

        const cachedMyVideosArgs = videoApi.util.selectCachedArgsForQuery(
          getState(),
          'getMyVideos'
        );
        for (const args of cachedMyVideosArgs) {
          dispatch(
            videoApi.util.updateQueryData('getMyVideos', args, (draft) => {
              const item = draft.data.find((v) => v.id === videoId);
              if (item) Object.assign(item, updated);
            })
          );
        }

        const cachedUserVideosArgs = videoApi.util.selectCachedArgsForQuery(
          getState(),
          'getUserVideos'
        );
        for (const args of cachedUserVideosArgs) {
          const filterVisibility = args.visibility;
          if (filterVisibility && filterVisibility !== updated.visibility) {
            dispatch(
              videoApi.util.updateQueryData('getUserVideos', args, (draft) => {
                draft.data = draft.data.filter((v) => v.id !== videoId);
              })
            );
            continue;
          }
          dispatch(
            videoApi.util.updateQueryData('getUserVideos', args, (draft) => {
              const item = draft.data.find((v) => v.id === videoId);
              if (item) Object.assign(item, updated);
            })
          );
        }
      },
    }),

    deleteVideo: builder.mutation<ApiResponse<null>, string>({
      query: (videoId) => ({
        url: `/${videoId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, videoId) => [
        { type: 'Video', id: videoId },
        'MyVideos',
        'UserVideos',
        'UserVideoVisibilityCounts',
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
  useGetUserVideosQuery,
  useGetUserVisibilityCountsQuery,
  useGetVideoByIdQuery,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} = videoApi;
