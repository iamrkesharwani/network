import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  PaginatedResponse,
  INotificationListItem,
  NotificationListQuery,
  IUnreadCountResponse,
  PushSubscriptionCreateInput,
  PushSubscriptionDeleteInput,
} from '@network/shared';
import type { RootState } from '../../app/store/store';

export const NOTIFICATION_LIST_ARGS = { limit: 20 };

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/notifications' }),
  tagTypes: ['Notification', 'UnreadCount'],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      PaginatedResponse<INotificationListItem>,
      NotificationListQuery
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
        for (const item of newData.data) byId.set(item.id, item);
        currentCache.data = Array.from(byId.values());
        currentCache.meta = newData.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<ApiResponse<IUnreadCountResponse>, void>({
      query: () => ({ url: '/unread-count', method: 'GET' }),
      providesTags: ['UnreadCount'],
    }),

    markAsRead: builder.mutation<ApiResponse<null>, string>({
      query: (notificationId) => ({
        url: `/${notificationId}/read`,
        method: 'PATCH',
      }),
      async onQueryStarted(notificationId, { dispatch, getState, queryFulfilled }) {
        const state = getState() as RootState;
        const cached = notificationApi.endpoints.getNotifications.select(
          NOTIFICATION_LIST_ARGS
        )(state);
        const wasUnread = cached.data?.data.some(
          (item) => item.id === notificationId && !item.isRead
        );

        const patches = [
          dispatch(
            notificationApi.util.updateQueryData(
              'getNotifications',
              NOTIFICATION_LIST_ARGS,
              (draft) => {
                const item = draft.data.find((n) => n.id === notificationId);
                if (item) item.isRead = true;
              }
            )
          ),
        ];

        if (wasUnread) {
          patches.push(
            dispatch(
              notificationApi.util.updateQueryData(
                'getUnreadCount',
                undefined,
                (draft) => {
                  draft.data.count = Math.max(0, draft.data.count - 1);
                }
              )
            )
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ['UnreadCount'],
    }),

    markAllAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/read-all', method: 'PATCH' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patches = [
          dispatch(
            notificationApi.util.updateQueryData(
              'getUnreadCount',
              undefined,
              (draft) => {
                draft.data.count = 0;
              }
            )
          ),
          dispatch(
            notificationApi.util.updateQueryData(
              'getNotifications',
              NOTIFICATION_LIST_ARGS,
              (draft) => {
                draft.data.forEach((item) => {
                  item.isRead = true;
                });
              }
            )
          ),
        ];

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: ['Notification', 'UnreadCount'],
    }),

    savePushSubscription: builder.mutation<
      ApiResponse<null>,
      PushSubscriptionCreateInput
    >({
      query: (data) => ({ url: '/push-subscriptions', method: 'POST', data }),
    }),

    deletePushSubscription: builder.mutation<
      ApiResponse<null>,
      PushSubscriptionDeleteInput
    >({
      query: (data) => ({
        url: '/push-subscriptions',
        method: 'DELETE',
        data,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useSavePushSubscriptionMutation,
  useDeletePushSubscriptionMutation,
} = notificationApi;
