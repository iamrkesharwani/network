import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IConversationSummary,
  ConversationListQuery,
  DirectConversationCreateInput,
  GroupConversationCreateInput,
  GroupUpdateInput,
  ParticipantAddInput,
} from '@network/shared';

export const CONVERSATION_LIST_ARGS = { limit: 20 };

export const conversationApi = createApi({
  reducerPath: 'conversationApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/conversations' }),
  tagTypes: ['Conversation'],
  endpoints: (builder) => ({
    getConversations: builder.query<
      PaginatedResponse<IConversationSummary>,
      ConversationListQuery
    >({
      query: (params) => ({ url: '/', method: 'GET', params }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
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
      providesTags: ['Conversation'],
    }),

    createDirectConversation: builder.mutation<
      ApiResponse<IConversationSummary>,
      DirectConversationCreateInput
    >({
      query: (data) => ({ url: '/direct', method: 'POST', data }),
      invalidatesTags: ['Conversation'],
    }),

    createGroupConversation: builder.mutation<
      ApiResponse<IConversationSummary>,
      GroupConversationCreateInput
    >({
      query: (data) => ({ url: '/group', method: 'POST', data }),
      invalidatesTags: ['Conversation'],
    }),

    addParticipants: builder.mutation<
      ApiResponse<IConversationSummary>,
      { conversationId: string } & ParticipantAddInput
    >({
      query: ({ conversationId, ...data }) => ({
        url: `/${conversationId}/participants`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Conversation'],
    }),

    updateGroup: builder.mutation<
      ApiResponse<IConversationSummary>,
      { conversationId: string } & GroupUpdateInput
    >({
      query: ({ conversationId, ...data }) => ({
        url: `/${conversationId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Conversation'],
    }),

    uploadGroupAvatar: builder.mutation<
      ApiResponse<IConversationSummary>,
      { conversationId: string; formData: FormData }
    >({
      query: ({ conversationId, formData }) => ({
        url: `/${conversationId}/avatar`,
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: ['Conversation'],
    }),

    leaveGroup: builder.mutation<ApiResponse<null>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversation'],
    }),

    markConversationRead: builder.mutation<ApiResponse<null>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/read`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateDirectConversationMutation,
  useCreateGroupConversationMutation,
  useAddParticipantsMutation,
  useUpdateGroupMutation,
  useUploadGroupAvatarMutation,
  useLeaveGroupMutation,
  useMarkConversationReadMutation,
} = conversationApi;
