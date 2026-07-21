import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  BookmarkableContentType,
  BookmarkFeedQuery,
  IBookmarkResponse,
  IBookmarkToggleResponse,
} from '@network/shared';

interface BookmarkStatusArgs {
  contentType: BookmarkableContentType;
  contentIds: string[];
}

export const bookmarkApi = createApi({
  reducerPath: 'bookmarkApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/bookmarks' }),
  tagTypes: ['Bookmark'],
  endpoints: (builder) => ({
    getBookmarkStatuses: builder.query<
      ApiResponse<Record<string, boolean>>,
      BookmarkStatusArgs
    >({
      query: ({ contentType, contentIds }) => ({
        url: '/status',
        method: 'GET',
        params: { contentType, contentIds: contentIds.join(',') },
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.contentType}:${[...queryArgs.contentIds].sort().join(',')}`,
    }),

    getBookmarks: builder.query<
      PaginatedResponse<IBookmarkResponse>,
      BookmarkFeedQuery
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
      providesTags: ['Bookmark'],
    }),

    toggleBookmark: builder.mutation<
      ApiResponse<IBookmarkToggleResponse>,
      { contentType: BookmarkableContentType; contentId: string }
    >({
      query: (data) => ({
        url: '/toggle',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Bookmark'],
      async onQueryStarted(
        { contentType, contentId },
        { dispatch, getState, queryFulfilled }
      ) {
        const matchingArgs = bookmarkApi.util
          .selectCachedArgsForQuery(getState(), 'getBookmarkStatuses')
          .filter(
            (args) =>
              args.contentType === contentType &&
              args.contentIds.includes(contentId)
          );

        const patches = matchingArgs.map((args) =>
          dispatch(
            bookmarkApi.util.updateQueryData(
              'getBookmarkStatuses',
              args,
              (draft) => {
                draft.data[contentId] = !draft.data[contentId];
              }
            )
          )
        );

        try {
          const result = await queryFulfilled;
          for (const args of matchingArgs) {
            dispatch(
              bookmarkApi.util.updateQueryData(
                'getBookmarkStatuses',
                args,
                (draft) => {
                  draft.data[contentId] = result.data.data.bookmarked;
                }
              )
            );
          }
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
});

export const {
  useGetBookmarkStatusesQuery,
  useGetBookmarksQuery,
  useToggleBookmarkMutation,
} = bookmarkApi;
