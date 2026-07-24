import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  IConversationSummary,
  ConversationListQuery,
  ConversationSearchQuery,
  ConversationMuteDuration,
  ConversationDisappearingTtl,
  DirectConversationCreateInput,
  GroupConversationCreateInput,
  GroupUpdateInput,
  ParticipantAddInput,
} from '@network/shared';

export const CONVERSATION_LIST_ARGS = { limit: 20 };
export const CONVERSATION_ARCHIVED_LIST_ARGS = { limit: 20 };

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

    getArchivedConversations: builder.query<
      PaginatedResponse<IConversationSummary>,
      ConversationListQuery
    >({
      query: (params) => ({ url: '/archived', method: 'GET', params }),
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

    searchConversations: builder.query<
      ApiResponse<IConversationSummary[]>,
      ConversationSearchQuery
    >({
      query: (params) => ({ url: '/search', method: 'GET', params }),
    }),

    markAllRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/mark-all-read', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        const state = getState();
        const patches = [
          ...conversationApi.util
            .selectCachedArgsForQuery(state, 'getConversations')
            .map((args) =>
              dispatch(
                conversationApi.util.updateQueryData(
                  'getConversations',
                  args,
                  (draft) => {
                    for (const item of draft.data) item.isUnread = false;
                  }
                )
              )
            ),
          ...conversationApi.util
            .selectCachedArgsForQuery(state, 'getArchivedConversations')
            .map((args) =>
              dispatch(
                conversationApi.util.updateQueryData(
                  'getArchivedConversations',
                  args,
                  (draft) => {
                    for (const item of draft.data) item.isUnread = false;
                  }
                )
              )
            ),
        ];

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
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
        headers: { 'Content-Type': 'multipart/form-data' },
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

    muteConversation: builder.mutation<
      ApiResponse<IConversationSummary>,
      { conversationId: string; duration: ConversationMuteDuration }
    >({
      query: ({ conversationId, duration }) => ({
        url: `/${conversationId}/mute`,
        method: 'POST',
        data: { duration },
      }),
      invalidatesTags: ['Conversation'],
    }),

    unmuteConversation: builder.mutation<ApiResponse<IConversationSummary>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/unmute`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversation'],
    }),

    archiveConversation: builder.mutation<ApiResponse<IConversationSummary>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/archive`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversation'],
    }),

    unarchiveConversation: builder.mutation<ApiResponse<IConversationSummary>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversation'],
    }),

    pinConversation: builder.mutation<ApiResponse<IConversationSummary>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/pin`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversation'],
    }),

    unpinConversation: builder.mutation<ApiResponse<IConversationSummary>, string>({
      query: (conversationId) => ({
        url: `/${conversationId}/unpin`,
        method: 'POST',
      }),
      invalidatesTags: ['Conversation'],
    }),

    setDisappearingTtl: builder.mutation<
      ApiResponse<IConversationSummary>,
      { conversationId: string; ttl: ConversationDisappearingTtl }
    >({
      query: ({ conversationId, ttl }) => ({
        url: `/${conversationId}/disappearing`,
        method: 'POST',
        data: { ttl },
      }),
      invalidatesTags: ['Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetArchivedConversationsQuery,
  useSearchConversationsQuery,
  useMarkAllReadMutation,
  useCreateDirectConversationMutation,
  useCreateGroupConversationMutation,
  useAddParticipantsMutation,
  useUpdateGroupMutation,
  useUploadGroupAvatarMutation,
  useLeaveGroupMutation,
  useMarkConversationReadMutation,
  useMuteConversationMutation,
  useUnmuteConversationMutation,
  useArchiveConversationMutation,
  useUnarchiveConversationMutation,
  usePinConversationMutation,
  useUnpinConversationMutation,
  useSetDisappearingTtlMutation,
} = conversationApi;
