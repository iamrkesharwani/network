import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  ConfirmPostVideoUploadInput,
  IInitiatePostVideoUploadResult,
  InitiatePostVideoUploadInput,
  IPostActionResult,
  IPostResponse,
  PaginatedResponse,
  PostFeedQuery,
  PostFinaliseInput,
  PostUpdateInput,
} from '@network/shared';

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/post' }),
  tagTypes: ['Post', 'MyPosts'],
  endpoints: (builder) => ({
    createPost: builder.mutation<ApiResponse<IPostActionResult>, FormData>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: ['MyPosts', 'Post'],
    }),

    initiateVideoUpload: builder.mutation<
      ApiResponse<IInitiatePostVideoUploadResult>,
      InitiatePostVideoUploadInput
    >({
      query: (data) => ({
        url: '/initiate-video-upload',
        method: 'POST',
        data,
      }),
    }),

    confirmVideoUpload: builder.mutation<
      ApiResponse<IPostResponse>,
      ConfirmPostVideoUploadInput
    >({
      query: (data) => ({
        url: '/confirm-video-upload',
        method: 'POST',
        data,
      }),
    }),

    finalisePost: builder.mutation<
      ApiResponse<IPostActionResult>,
      { postId: string } & PostFinaliseInput
    >({
      query: ({ postId, ...data }) => ({
        url: `/${postId}/finalise`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['MyPosts'],
    }),

    getFeed: builder.query<PaginatedResponse<IPostResponse>, PostFeedQuery>({
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
      providesTags: ['Post'],
    }),

    getMyPosts: builder.query<PaginatedResponse<IPostResponse>, PostFeedQuery>({
      query: (params) => ({
        url: '/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['MyPosts'],
    }),

    getPostById: builder.query<ApiResponse<IPostResponse>, string>({
      query: (postId) => ({
        url: `/${postId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),

    updatePost: builder.mutation<
      ApiResponse<IPostResponse>,
      { postId: string } & PostUpdateInput
    >({
      query: ({ postId, ...data }) => ({
        url: `/${postId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Post', id: postId },
        'MyPosts',
      ],
    }),

    deletePost: builder.mutation<ApiResponse<null>, string>({
      query: (postId) => ({
        url: `/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Post', id: postId },
        'MyPosts',
        'Post',
      ],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useInitiateVideoUploadMutation,
  useConfirmVideoUploadMutation,
  useFinalisePostMutation,
  useGetFeedQuery,
  useGetMyPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
