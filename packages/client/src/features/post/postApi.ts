import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IPostActionResult,
  IPostResponse,
  IVisibilityCounts,
  PaginatedResponse,
  PostFeedQuery,
  PostUpdateInput,
  PostUserFeedQuery,
} from '@network/shared';

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/post' }),
  tagTypes: ['Post', 'MyPosts', 'UserPosts', 'UserPostVisibilityCounts'],
  endpoints: (builder) => ({
    createPost: builder.mutation<ApiResponse<IPostActionResult>, FormData>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: ['MyPosts', 'Post', 'UserPostVisibilityCounts'],
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
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) {
          byId.set(item.id, item);
        }
        currentCache.data = Array.from(byId.values());
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
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) {
          byId.set(item.id, item);
        }
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['UserPosts'],
    }),

    getUserVisibilityCounts: builder.query<
      ApiResponse<IVisibilityCounts>,
      string
    >({
      query: (username) => ({
        url: `/user/${username}/visibility-counts`,
        method: 'GET',
      }),
      providesTags: (_result, _error, username) => [
        { type: 'UserPostVisibilityCounts', id: username },
      ],
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
        'UserPostVisibilityCounts',
      ],
      async onQueryStarted({ postId }, { dispatch, getState, queryFulfilled }) {
        const { data: result } = await queryFulfilled.catch(() => ({
          data: undefined,
        }));
        if (!result) return;
        const updated = result.data;

        dispatch(
          postApi.util.updateQueryData('getPostById', postId, (draft) => {
            Object.assign(draft.data, updated);
          })
        );

        const cachedMyPostsArgs = postApi.util.selectCachedArgsForQuery(
          getState(),
          'getMyPosts'
        );
        for (const args of cachedMyPostsArgs) {
          dispatch(
            postApi.util.updateQueryData('getMyPosts', args, (draft) => {
              const item = draft.data.find((p) => p.id === postId);
              if (item) Object.assign(item, updated);
            })
          );
        }

        const cachedUserPostsArgs = postApi.util.selectCachedArgsForQuery(
          getState(),
          'getUserPosts'
        );
        for (const args of cachedUserPostsArgs) {
          const filterVisibility = args.visibility;
          if (filterVisibility && filterVisibility !== updated.visibility) {
            dispatch(
              postApi.util.updateQueryData('getUserPosts', args, (draft) => {
                draft.data = draft.data.filter((p) => p.id !== postId);
              })
            );
            continue;
          }
          dispatch(
            postApi.util.updateQueryData('getUserPosts', args, (draft) => {
              const item = draft.data.find((p) => p.id === postId);
              if (item) Object.assign(item, updated);
            })
          );
        }
      },
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
        'UserPostVisibilityCounts',
        'Post',
      ],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetFeedQuery,
  useGetMyPostsQuery,
  useGetUserPostsQuery,
  useGetUserVisibilityCountsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
