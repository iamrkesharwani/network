import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  EngageableContentType,
  ILikeToggleResponse,
} from '@network/shared';

interface LikeStatusArgs {
  contentType: EngageableContentType;
  contentIds: string[];
}

export const likeApi = createApi({
  reducerPath: 'likeApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/likes' }),
  endpoints: (builder) => ({
    getLikeStatuses: builder.query<
      ApiResponse<Record<string, boolean>>,
      LikeStatusArgs
    >({
      query: ({ contentType, contentIds }) => ({
        url: '/status',
        method: 'GET',
        params: { contentType, contentIds: contentIds.join(',') },
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.contentType}:${[...queryArgs.contentIds].sort().join(',')}`,
    }),

    toggleLike: builder.mutation<
      ApiResponse<ILikeToggleResponse>,
      { contentType: EngageableContentType; contentId: string }
    >({
      query: (data) => ({
        url: '/toggle',
        method: 'POST',
        data,
      }),
      async onQueryStarted(
        { contentType, contentId },
        { dispatch, getState, queryFulfilled }
      ) {
        const matchingArgs = likeApi.util
          .selectCachedArgsForQuery(getState(), 'getLikeStatuses')
          .filter(
            (args) =>
              args.contentType === contentType &&
              args.contentIds.includes(contentId)
          );

        const patches = matchingArgs.map((args) =>
          dispatch(
            likeApi.util.updateQueryData(
              'getLikeStatuses',
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
              likeApi.util.updateQueryData(
                'getLikeStatuses',
                args,
                (draft) => {
                  draft.data[contentId] = result.data.data.liked;
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

export const { useGetLikeStatusesQuery, useToggleLikeMutation } = likeApi;
