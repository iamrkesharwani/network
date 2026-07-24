import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type { RootState } from '../../app/store/store';
import {
  type ApiResponse,
  type PaginatedResponse,
  type IMessageResponse,
  type IMessageAttachmentUploadResult,
  type MessageListQuery,
  type MessageSearchQuery,
  type MessageSendInput,
  type MessageDeleteInput,
  type MessageReactionSetInput,
  type MessageEditInput,
} from '@network/shared';

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/messages' }),
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    getMessages: builder.query<
      PaginatedResponse<IMessageResponse>,
      { conversationId: string } & MessageListQuery
    >({
      query: ({ conversationId, ...params }) => ({
        url: `/${conversationId}`,
        method: 'GET',
        params,
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.conversationId}:${queryArgs.limit}`,
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
      providesTags: ['Message'],
    }),

    sendMessage: builder.mutation<ApiResponse<IMessageResponse>, MessageSendInput>({
      query: (data) => ({ url: '/', method: 'POST', data }),
    }),

    deleteMessage: builder.mutation<
      ApiResponse<null>,
      { messageId: string } & MessageDeleteInput
    >({
      query: ({ messageId, ...data }) => ({
        url: `/${messageId}`,
        method: 'DELETE',
        data,
      }),
    }),

    getMessageById: builder.query<ApiResponse<IMessageResponse>, string>({
      query: (messageId) => ({ url: `/single/${messageId}`, method: 'GET' }),
    }),

    editMessage: builder.mutation<
      ApiResponse<IMessageResponse>,
      { messageId: string } & MessageEditInput
    >({
      query: ({ messageId, ...data }) => ({
        url: `/${messageId}`,
        method: 'PATCH',
        data,
      }),
      async onQueryStarted(
        { messageId, content },
        { dispatch, getState, queryFulfilled }
      ) {
        const editedAt = new Date().toISOString();
        const cachedArgs = messageApi.util.selectCachedArgsForQuery(
          getState(),
          'getMessages'
        );
        const patches = cachedArgs.map((args) =>
          dispatch(
            messageApi.util.updateQueryData('getMessages', args, (draft) => {
              const message = draft.data.find((m) => m.id === messageId);
              if (message) {
                message.content = content;
                message.editedAt = editedAt;
              }
            })
          )
        );

        try {
          const result = await queryFulfilled;
          for (const args of cachedArgs) {
            dispatch(
              messageApi.util.updateQueryData('getMessages', args, (draft) => {
                const message = draft.data.find((m) => m.id === messageId);
                if (message) Object.assign(message, result.data.data);
              })
            );
          }
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    setMessageReaction: builder.mutation<
      ApiResponse<IMessageResponse>,
      { messageId: string } & MessageReactionSetInput
    >({
      query: ({ messageId, ...data }) => ({
        url: `/${messageId}/reactions`,
        method: 'PUT',
        data,
      }),
      async onQueryStarted(
        { messageId, content },
        { dispatch, getState, queryFulfilled }
      ) {
        const state = getState() as unknown as RootState;
        const myUserId = state.auth.user?.id;
        if (!myUserId) return;

        const createdAt = new Date().toISOString();
        const cachedArgs = messageApi.util.selectCachedArgsForQuery(
          state,
          'getMessages'
        );
        const patches = cachedArgs.map((args) =>
          dispatch(
            messageApi.util.updateQueryData('getMessages', args, (draft) => {
              const message = draft.data.find((m) => m.id === messageId);
              if (!message) return;
              const withoutMine = message.reactions.filter(
                (reaction) => reaction.userId !== myUserId
              );
              message.reactions = [
                ...withoutMine,
                { userId: myUserId, content, createdAt },
              ];
            })
          )
        );

        try {
          const result = await queryFulfilled;
          for (const args of cachedArgs) {
            dispatch(
              messageApi.util.updateQueryData('getMessages', args, (draft) => {
                const message = draft.data.find((m) => m.id === messageId);
                if (message) message.reactions = result.data.data.reactions;
              })
            );
          }
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    removeMessageReaction: builder.mutation<
      ApiResponse<null>,
      { messageId: string }
    >({
      query: ({ messageId }) => ({
        url: `/${messageId}/reactions`,
        method: 'DELETE',
      }),
      async onQueryStarted({ messageId }, { dispatch, getState, queryFulfilled }) {
        const state = getState() as unknown as RootState;
        const myUserId = state.auth.user?.id;
        if (!myUserId) return;

        const cachedArgs = messageApi.util.selectCachedArgsForQuery(
          state,
          'getMessages'
        );
        const patches = cachedArgs.map((args) =>
          dispatch(
            messageApi.util.updateQueryData('getMessages', args, (draft) => {
              const message = draft.data.find((m) => m.id === messageId);
              if (!message) return;
              message.reactions = message.reactions.filter(
                (reaction) => reaction.userId !== myUserId
              );
            })
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    uploadMessageAttachment: builder.mutation<
      ApiResponse<IMessageAttachmentUploadResult>,
      FormData
    >({
      query: (data) => ({
        url: '/attachments/upload',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),

    searchMessages: builder.query<
      ApiResponse<IMessageResponse[]>,
      { conversationId: string } & MessageSearchQuery
    >({
      query: ({ conversationId, ...params }) => ({
        url: `/${conversationId}/search`,
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetMessageByIdQuery,
  useEditMessageMutation,
  useSetMessageReactionMutation,
  useRemoveMessageReactionMutation,
  useUploadMessageAttachmentMutation,
  useSearchMessagesQuery,
} = messageApi;
