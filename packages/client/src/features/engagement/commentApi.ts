import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  ContentType,
  CreateCommentInput,
  ICommentResponse,
  PaginatedResponse,
} from '@network/shared';

interface ListCommentsArgs {
  contentType: ContentType;
  contentId: string;
  parentCommentId?: string;
  cursor?: string;
  limit?: number;
}

interface CommentTargetArgs {
  contentType: ContentType;
  contentId: string;
  parentCommentId?: string;
}

export const commentApi = createApi({
  reducerPath: 'commentApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/comments' }),
  endpoints: (builder) => ({
    listComments: builder.query<
      PaginatedResponse<ICommentResponse>,
      ListCommentsArgs
    >({
      query: (params) => ({
        url: '/',
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.contentType}:${queryArgs.contentId}:${queryArgs.parentCommentId ?? 'root'}`,
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
    }),

    createComment: builder.mutation<
      ApiResponse<ICommentResponse>,
      CreateCommentInput
    >({
      query: (data) => ({
        url: '/',
        method: 'POST',
        data,
      }),
      async onQueryStarted(input, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (!result) return;

        dispatch(
          commentApi.util.updateQueryData(
            'listComments',
            {
              contentType: input.contentType,
              contentId: input.contentId,
              parentCommentId: input.parentCommentId,
            },
            (draft) => {
              draft.data = [result.data.data, ...draft.data];
            }
          )
        );
      },
    }),

    updateComment: builder.mutation<
      ApiResponse<ICommentResponse>,
      CommentTargetArgs & { commentId: string; text: string }
    >({
      query: ({ commentId, text }) => ({
        url: `/${commentId}`,
        method: 'PATCH',
        data: { text },
      }),
      async onQueryStarted(
        { contentType, contentId, parentCommentId },
        { dispatch, queryFulfilled }
      ) {
        const result = await queryFulfilled.catch(() => null);
        if (!result) return;
        const updated = result.data.data;

        dispatch(
          commentApi.util.updateQueryData(
            'listComments',
            { contentType, contentId, parentCommentId },
            (draft) => {
              const item = draft.data.find((c) => c.id === updated.id);
              if (item) Object.assign(item, updated);
            }
          )
        );
      },
    }),

    deleteComment: builder.mutation<
      ApiResponse<ICommentResponse>,
      CommentTargetArgs & { commentId: string }
    >({
      query: ({ commentId }) => ({
        url: `/${commentId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(
        { contentType, contentId, parentCommentId },
        { dispatch, queryFulfilled }
      ) {
        const result = await queryFulfilled.catch(() => null);
        if (!result) return;
        const updated = result.data.data;

        dispatch(
          commentApi.util.updateQueryData(
            'listComments',
            { contentType, contentId, parentCommentId },
            (draft) => {
              const item = draft.data.find((c) => c.id === updated.id);
              if (item) Object.assign(item, updated);
            }
          )
        );
      },
    }),
  }),
});

export const {
  useListCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
