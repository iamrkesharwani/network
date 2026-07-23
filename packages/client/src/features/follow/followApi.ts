import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import { creatorApi } from '../creator/creatorApi';
import type {
  ApiResponse,
  PaginatedResponse,
  IFollowListItem,
  IFollowRequestListItem,
  FollowListQuery,
  FollowState,
} from '@network/shared';

interface FollowListArgs extends FollowListQuery {
  username: string;
}

interface RemoveFollowerArgs {
  username: string;
  ownUsername: string;
}

const patchViewerFollowState = (username: string, state: FollowState) =>
  creatorApi.util.updateQueryData(
    'getPublicProfileByUsername',
    username,
    (draft) => {
      draft.data.followState = state;
      if (state === 'accepted') draft.data.followerCount += 1;
    }
  );

const patchUnfollow = (username: string) =>
  creatorApi.util.updateQueryData(
    'getPublicProfileByUsername',
    username,
    (draft) => {
      if (draft.data.followState === 'accepted') {
        draft.data.followerCount = Math.max(0, draft.data.followerCount - 1);
      }
      draft.data.followState = 'none';
    }
  );

const patchOwnFollowerCount = (ownUsername: string) =>
  creatorApi.util.updateQueryData(
    'getPublicProfileByUsername',
    ownUsername,
    (draft) => {
      draft.data.followerCount = Math.max(0, draft.data.followerCount - 1);
    }
  );

export const followApi = createApi({
  reducerPath: 'followApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/follow' }),
  tagTypes: ['Followers', 'Following', 'FollowRequests'],
  endpoints: (builder) => ({
    followUser: builder.mutation<ApiResponse<{ state: FollowState }>, string>({
      query: (username) => ({ url: `/${username}`, method: 'PUT' }),
      onQueryStarted: async (username, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(patchViewerFollowState(username, data.data.state));
        } catch {
          // Nothing was optimistically changed, so there's nothing to undo.
        }
      },
    }),

    unfollowUser: builder.mutation<ApiResponse<null>, string>({
      query: (username) => ({ url: `/${username}`, method: 'DELETE' }),
      onQueryStarted: async (username, { dispatch, queryFulfilled }) => {
        const patch = dispatch(patchUnfollow(username));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    getFollowers: builder.query<PaginatedResponse<IFollowListItem>, FollowListArgs>({
      query: ({ username, cursor, limit }) => ({
        url: `/${username}/followers`,
        method: 'GET',
        params: { ...(cursor && { cursor }), ...(limit && { limit }) },
      }),
      serializeQueryArgs: ({ queryArgs }) => `followers:${queryArgs.username}`,
      merge: (currentCache, newData, { arg }) => {
        if (arg.cursor === undefined) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) byId.set(item.id, item);
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: (_result, _error, { username }) => [
        { type: 'Followers', id: username },
      ],
    }),

    getFollowing: builder.query<PaginatedResponse<IFollowListItem>, FollowListArgs>({
      query: ({ username, cursor, limit }) => ({
        url: `/${username}/following`,
        method: 'GET',
        params: { ...(cursor && { cursor }), ...(limit && { limit }) },
      }),
      serializeQueryArgs: ({ queryArgs }) => `following:${queryArgs.username}`,
      merge: (currentCache, newData, { arg }) => {
        if (arg.cursor === undefined) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) byId.set(item.id, item);
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: (_result, _error, { username }) => [
        { type: 'Following', id: username },
      ],
    }),

    removeFollower: builder.mutation<ApiResponse<null>, RemoveFollowerArgs>({
      query: ({ username }) => ({ url: `/followers/${username}`, method: 'DELETE' }),
      onQueryStarted: async ({ ownUsername }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(patchOwnFollowerCount(ownUsername));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, { ownUsername }) => [
        { type: 'Followers', id: ownUsername },
      ],
    }),

    getFollowRequests: builder.query<
      PaginatedResponse<IFollowRequestListItem>,
      FollowListQuery
    >({
      query: ({ cursor, limit }) => ({
        url: '/requests',
        method: 'GET',
        params: { ...(cursor && { cursor }), ...(limit && { limit }) },
      }),
      serializeQueryArgs: () => 'requests',
      merge: (currentCache, newData, { arg }) => {
        if (arg.cursor === undefined) {
          currentCache.data = newData.data;
          currentCache.meta = newData.meta;
          return;
        }
        const byId = new Map(currentCache.data.map((item) => [item.id, item]));
        for (const item of newData.data) byId.set(item.id, item);
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['FollowRequests'],
    }),

    getFollowRequestCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => ({ url: '/requests/count', method: 'GET' }),
      providesTags: ['FollowRequests'],
    }),

    approveFollowRequest: builder.mutation<ApiResponse<null>, string>({
      query: (requestId) => ({
        url: `/requests/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['FollowRequests'],
    }),

    denyFollowRequest: builder.mutation<ApiResponse<null>, string>({
      query: (requestId) => ({ url: `/requests/${requestId}`, method: 'DELETE' }),
      invalidatesTags: ['FollowRequests'],
    }),
  }),
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useRemoveFollowerMutation,
  useGetFollowRequestsQuery,
  useGetFollowRequestCountQuery,
  useApproveFollowRequestMutation,
  useDenyFollowRequestMutation,
} = followApi;
