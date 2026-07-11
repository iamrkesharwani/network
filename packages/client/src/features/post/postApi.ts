import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IPostActionResult,
  IPostResponse,
  PaginatedResponse,
  PostFeedQuery,
  PostFinaliseInput,
  PostUpdateInput,
  PostUserFeedQuery,
} from '@network/shared';

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/post' }),
  tagTypes: ['Post', 'MyPosts', 'UserPosts'],
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
        if (arg.cursor === undefined) {
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
        currentArg?.cursor !== previousArg?.cursor,
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

    getUserPosts: builder.query<
      PaginatedResponse<IPostResponse>,
      { username: string } & PostUserFeedQuery
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
        const existingIds = new Set(currentCache.data.map((item) => item.id));
        for (const item of newData.data) {
          if (!existingIds.has(item.id)) {
            currentCache.data.push(item);
          }
        }
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['UserPosts'],
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
        'UserPosts',
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
        'UserPosts',
        'Post',
      ],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useFinalisePostMutation,
  useGetFeedQuery,
  useGetMyPostsQuery,
  useGetUserPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
