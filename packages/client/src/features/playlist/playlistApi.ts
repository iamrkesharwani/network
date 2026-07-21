import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IPlaylistContainingEntry,
  IPlaylistDetail,
  IPlaylistItemResponse,
  IPlaylistSummary,
  PlaylistContentType,
  PlaylistCreateInput,
  PlaylistFeedQuery,
  PlaylistUpdateInput,
} from '@network/shared';

export const playlistApi = createApi({
  reducerPath: 'playlistApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/playlists' }),
  tagTypes: ['Playlist', 'PlaylistItem', 'PlaylistContaining'],
  endpoints: (builder) => ({
    getMyPlaylists: builder.query<
      PaginatedResponse<IPlaylistSummary>,
      PlaylistFeedQuery
    >({
      query: (params) => ({
        url: '/',
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
      providesTags: ['Playlist'],
    }),

    getUserPlaylists: builder.query<
      PaginatedResponse<IPlaylistSummary>,
      PlaylistFeedQuery & { username: string }
    >({
      query: ({ username, ...params }) => ({
        url: `/user/${username}`,
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => `${queryArgs.username}`,
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
      providesTags: ['Playlist'],
    }),

    getPlaylist: builder.query<ApiResponse<IPlaylistDetail>, string>({
      query: (playlistId) => ({
        url: `/${playlistId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, playlistId) => [
        { type: 'Playlist', id: playlistId },
      ],
    }),

    getPlaylistItems: builder.query<
      PaginatedResponse<IPlaylistItemResponse>,
      { playlistId: string; cursor?: string; limit?: number }
    >({
      query: ({ playlistId, ...params }) => ({
        url: `/${playlistId}/items`,
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) => queryArgs.playlistId,
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
      providesTags: (_result, _error, { playlistId }) => [
        { type: 'PlaylistItem', id: playlistId },
      ],
    }),

    getContainingPlaylists: builder.query<
      ApiResponse<IPlaylistContainingEntry[]>,
      { contentType: PlaylistContentType; contentId: string }
    >({
      query: (params) => ({
        url: '/containing',
        method: 'GET',
        params,
      }),
      providesTags: (_result, _error, { contentId }) => [
        { type: 'PlaylistContaining', id: contentId },
      ],
    }),

    createPlaylist: builder.mutation<
      ApiResponse<IPlaylistSummary>,
      PlaylistCreateInput
    >({
      query: (data) => ({
        url: '/',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Playlist'],
    }),

    updatePlaylist: builder.mutation<
      ApiResponse<IPlaylistSummary>,
      { playlistId: string; data: PlaylistUpdateInput }
    >({
      query: ({ playlistId, data }) => ({
        url: `/${playlistId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [
        'Playlist',
        { type: 'Playlist', id: playlistId },
      ],
    }),

    deletePlaylist: builder.mutation<ApiResponse<null>, string>({
      query: (playlistId) => ({
        url: `/${playlistId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Playlist'],
    }),

    addItemToPlaylist: builder.mutation<
      ApiResponse<null>,
      { playlistId: string; contentType: PlaylistContentType; contentId: string }
    >({
      query: ({ playlistId, ...data }) => ({
        url: `/${playlistId}/items`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, { playlistId, contentId }) => [
        'Playlist',
        { type: 'PlaylistItem', id: playlistId },
        { type: 'PlaylistContaining', id: contentId },
      ],
    }),

    removeItemFromPlaylist: builder.mutation<
      ApiResponse<null>,
      { playlistId: string; itemId: string; contentId: string }
    >({
      query: ({ playlistId, itemId }) => ({
        url: `/${playlistId}/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { playlistId, contentId }) => [
        'Playlist',
        { type: 'PlaylistItem', id: playlistId },
        { type: 'PlaylistContaining', id: contentId },
      ],
    }),

    uploadPlaylistCover: builder.mutation<
      ApiResponse<IPlaylistSummary>,
      { playlistId: string; data: FormData }
    >({
      query: ({ playlistId, data }) => ({
        url: `/${playlistId}/cover`,
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [
        'Playlist',
        { type: 'Playlist', id: playlistId },
      ],
    }),

    removePlaylistCover: builder.mutation<ApiResponse<IPlaylistSummary>, string>({
      query: (playlistId) => ({
        url: `/${playlistId}/cover`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, playlistId) => [
        'Playlist',
        { type: 'Playlist', id: playlistId },
      ],
    }),

    reorderPlaylistItems: builder.mutation<
      ApiResponse<null>,
      { playlistId: string; itemId: string; toIndex: number }
    >({
      query: ({ playlistId, itemId, toIndex }) => ({
        url: `/${playlistId}/reorder`,
        method: 'PATCH',
        data: { itemId, toIndex },
      }),
      async onQueryStarted(
        { playlistId, itemId, toIndex },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          playlistApi.util.updateQueryData(
            'getPlaylistItems',
            { playlistId },
            (draft) => {
              const items = [...draft.data].sort((a, b) => a.position - b.position);
              const fromIndex = items.findIndex((item) => item.id === itemId);
              if (fromIndex === -1) return;

              const [moved] = items.splice(fromIndex, 1);
              if (!moved) return;
              items.splice(toIndex, 0, moved);

              items.forEach((item, index) => {
                item.position = index;
              });
              draft.data = items;
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, { playlistId }) => [
        { type: 'PlaylistItem', id: playlistId },
      ],
    }),
  }),
});

export const {
  useGetMyPlaylistsQuery,
  useGetUserPlaylistsQuery,
  useGetPlaylistQuery,
  useGetPlaylistItemsQuery,
  useGetContainingPlaylistsQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddItemToPlaylistMutation,
  useRemoveItemFromPlaylistMutation,
  useReorderPlaylistItemsMutation,
  useUploadPlaylistCoverMutation,
  useRemovePlaylistCoverMutation,
} = playlistApi;
