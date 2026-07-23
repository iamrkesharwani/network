import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IMessageResponse,
  IMessageAttachmentUploadResult,
  MessageListQuery,
  MessageSendInput,
  MessageDeleteInput,
  MessageReactionSetInput,
  MessageEditInput,
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
    }),

    removeMessageReaction: builder.mutation<
      ApiResponse<null>,
      { messageId: string }
    >({
      query: ({ messageId }) => ({
        url: `/${messageId}/reactions`,
        method: 'DELETE',
      }),
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
} = messageApi;
