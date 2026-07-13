import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  ConfirmShortUploadInput,
  IInitiateShortUploadResult,
  InitiateShortUploadInput,
  IShortActionResult,
  IShortResponse,
  IVisibilityCounts,
  PaginatedResponse,
  ShortFeedQuery,
  ShortUpdateInput,
  ShortUploadInput,
  ShortUserFeedQuery,
} from '@network/shared';

export const shortApi = createApi({
  reducerPath: 'shortApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/short' }),
  tagTypes: ['Short', 'MyShorts', 'UserShorts', 'UserShortVisibilityCounts'],
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

    finaliseShort: builder.mutation<
      ApiResponse<IShortActionResult>,
      { shortId: string } & ShortUploadInput
    >({
      query: ({ shortId, ...data }) => ({
        url: `/${shortId}/finalise`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['MyShorts', 'UserShortVisibilityCounts'],
    }),

    getFeed: builder.query<PaginatedResponse<IShortResponse>, ShortFeedQuery>({
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
      providesTags: ['MyShorts'],
    }),

    getUserShorts: builder.query<
      PaginatedResponse<IShortResponse>,
      { username: string } & ShortUserFeedQuery
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
      providesTags: ['UserShorts'],
    }),

    getUserVisibilityCounts: builder.query<ApiResponse<IVisibilityCounts>, string>({
      query: (username) => ({
        url: `/user/${username}/visibility-counts`,
        method: 'GET',
      }),
      providesTags: (_result, _error, username) => [
        { type: 'UserShortVisibilityCounts', id: username },
      ],
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
        'UserShorts',
        'UserShortVisibilityCounts',
      ],
      async onQueryStarted({ shortId }, { dispatch, getState, queryFulfilled }) {
        const { data: result } = await queryFulfilled.catch(() => ({
          data: undefined,
        }));
        if (!result) return;
        const updated = result.data;

        dispatch(
          shortApi.util.updateQueryData('getShortById', shortId, (draft) => {
            Object.assign(draft.data, updated);
          })
        );

        const cachedMyShortsArgs = shortApi.util.selectCachedArgsForQuery(
          getState(),
          'getMyShorts'
        );
        for (const args of cachedMyShortsArgs) {
          dispatch(
            shortApi.util.updateQueryData('getMyShorts', args, (draft) => {
              const item = draft.data.find((s) => s.id === shortId);
              if (item) Object.assign(item, updated);
            })
          );
        }

        const cachedUserShortsArgs = shortApi.util.selectCachedArgsForQuery(
          getState(),
          'getUserShorts'
        );
        for (const args of cachedUserShortsArgs) {
          const filterVisibility = args.visibility;
          if (filterVisibility && filterVisibility !== updated.visibility) {
            dispatch(
              shortApi.util.updateQueryData('getUserShorts', args, (draft) => {
                draft.data = draft.data.filter((s) => s.id !== shortId);
              })
            );
            continue;
          }
          dispatch(
            shortApi.util.updateQueryData('getUserShorts', args, (draft) => {
              const item = draft.data.find((s) => s.id === shortId);
              if (item) Object.assign(item, updated);
            })
          );
        }
      },
    }),

    deleteShort: builder.mutation<ApiResponse<null>, string>({
      query: (shortId) => ({
        url: `/${shortId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, shortId) => [
        { type: 'Short', id: shortId },
        'MyShorts',
        'UserShorts',
        'UserShortVisibilityCounts',
        'Short',
      ],
    }),
  }),
});

export const {
  useInitiateUploadMutation,
  useConfirmUploadMutation,
  useUploadThumbnailMutation,
  useFinaliseShortMutation,
  useGetFeedQuery,
  useGetMyShortsQuery,
  useGetUserShortsQuery,
  useGetUserVisibilityCountsQuery,
  useGetShortByIdQuery,
  useUpdateShortMutation,
  useDeleteShortMutation,
} = shortApi;
