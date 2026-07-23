import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IBlockedUserListItem,
  BlockListQuery,
} from '@network/shared';

export const blockApi = createApi({
  reducerPath: 'blockApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/block' }),
  tagTypes: ['BlockedUsers'],
  endpoints: (builder) => ({
    blockUser: builder.mutation<ApiResponse<null>, string>({
      query: (username) => ({ url: `/${username}`, method: 'PUT' }),
      invalidatesTags: ['BlockedUsers'],
    }),

    unblockUser: builder.mutation<ApiResponse<null>, string>({
      query: (username) => ({ url: `/${username}`, method: 'DELETE' }),
      invalidatesTags: ['BlockedUsers'],
    }),

    getBlockedUsers: builder.query<
      PaginatedResponse<IBlockedUserListItem>,
      BlockListQuery
    >({
      query: ({ cursor, limit }) => ({
        url: '',
        method: 'GET',
        params: { ...(cursor && { cursor }), ...(limit && { limit }) },
      }),
      serializeQueryArgs: () => 'blocked',
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
      providesTags: ['BlockedUsers'],
    }),
  }),
});

export const {
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetBlockedUsersQuery,
} = blockApi;
