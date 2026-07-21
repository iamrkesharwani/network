import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  ContentType,
  CreateCommentInput,
  ICommentResponse,
  PaginatedResponse,
} from '@network/shared';
import type { RootState } from '../../app/store/store';
import { videoApi } from '../video/videoApi';
import { shortApi } from '../short/shortApi';
import { postApi } from '../post/postApi';

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
      async onQueryStarted(input, { dispatch, getState, queryFulfilled }) {
        const state = getState() as unknown as RootState;
        const author = state.auth.user;
        if (!author) return;

        const tempId = `optimistic-${crypto.randomUUID()}`;
        const now = new Date().toISOString();
        const optimisticComment: ICommentResponse = {
          id: tempId,
          contentType: input.contentType,
          contentId: input.contentId,
          parentCommentId: input.parentCommentId ?? null,
          text: input.text,
          likes: 0,
          repliesCount: 0,
          edited: false,
          moderationStatus: 'active',
          createdAt: now,
          updatedAt: now,
          author: {
            id: author.id,
            username: author.username,
            avatarUrl: author.avatarUrl,
          },
          isDeleted: false,
        };

        const patches = [
          dispatch(
            commentApi.util.updateQueryData(
              'listComments',
              {
                contentType: input.contentType,
                contentId: input.contentId,
                parentCommentId: input.parentCommentId,
              },
              (draft) => {
                draft.data = [optimisticComment, ...draft.data];
              }
            )
          ),
        ];

        if (input.parentCommentId) {
          patches.push(
            dispatch(
              commentApi.util.updateQueryData(
                'listComments',
                {
                  contentType: input.contentType,
                  contentId: input.contentId,
                  parentCommentId: undefined,
                },
                (draft) => {
                  const parent = draft.data.find(
                    (c) => c.id === input.parentCommentId
                  );
                  if (parent) parent.repliesCount += 1;
                }
              )
            )
          );
        } else if (input.contentType === 'video') {
          patches.push(
            dispatch(
              videoApi.util.updateQueryData(
                'getVideoById',
                input.contentId,
                (draft) => {
                  draft.data.commentsCount += 1;
                }
              )
            )
          );
          for (const listEndpoint of [
            'getFeed',
            'getMyVideos',
            'getUserVideos',
          ] as const) {
            const cachedArgs = videoApi.util.selectCachedArgsForQuery(
              state,
              listEndpoint
            );
            for (const args of cachedArgs) {
              patches.push(
                dispatch(
                  videoApi.util.updateQueryData(listEndpoint, args, (draft) => {
                    const item = draft.data.find(
                      (v) => v.id === input.contentId
                    );
                    if (item) item.commentsCount += 1;
                  })
                )
              );
            }
          }
        } else if (input.contentType === 'short') {
          patches.push(
            dispatch(
              shortApi.util.updateQueryData(
                'getShortById',
                input.contentId,
                (draft) => {
                  draft.data.commentsCount += 1;
                }
              )
            )
          );
          for (const listEndpoint of [
            'getFeed',
            'getMyShorts',
            'getUserShorts',
          ] as const) {
            const cachedArgs = shortApi.util.selectCachedArgsForQuery(
              state,
              listEndpoint
            );
            for (const args of cachedArgs) {
              patches.push(
                dispatch(
                  shortApi.util.updateQueryData(listEndpoint, args, (draft) => {
                    const item = draft.data.find(
                      (s) => s.id === input.contentId
                    );
                    if (item) item.commentsCount += 1;
                  })
                )
              );
            }
          }
        } else {
          patches.push(
            dispatch(
              postApi.util.updateQueryData(
                'getPostById',
                input.contentId,
                (draft) => {
                  draft.data.commentsCount += 1;
                }
              )
            )
          );
          for (const listEndpoint of [
            'getFeed',
            'getMyPosts',
            'getUserPosts',
          ] as const) {
            const cachedArgs = postApi.util.selectCachedArgsForQuery(
              state,
              listEndpoint
            );
            for (const args of cachedArgs) {
              patches.push(
                dispatch(
                  postApi.util.updateQueryData(listEndpoint, args, (draft) => {
                    const item = draft.data.find(
                      (p) => p.id === input.contentId
                    );
                    if (item) item.commentsCount += 1;
                  })
                )
              );
            }
          }
        }

        try {
          const result = await queryFulfilled;
          dispatch(
            commentApi.util.updateQueryData(
              'listComments',
              {
                contentType: input.contentType,
                contentId: input.contentId,
                parentCommentId: input.parentCommentId,
              },
              (draft) => {
                const idx = draft.data.findIndex((c) => c.id === tempId);
                if (idx !== -1) draft.data[idx] = result.data.data;
              }
            )
          );
        } catch {
          patches.forEach((patch) => patch.undo());
        }
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
              if (item) {
                Object.assign(item, updated);
                if (!parentCommentId) item.repliesCount = 0;
              }
            }
          )
        );

        if (!parentCommentId) {
          dispatch(
            commentApi.util.updateQueryData(
              'listComments',
              { contentType, contentId, parentCommentId: updated.id },
              (draft) => {
                draft.data = [];
              }
            )
          );
        }
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
