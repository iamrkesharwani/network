import { useEffect } from 'react';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { notificationApi, NOTIFICATION_LIST_ARGS } from '../notificationApi';
import type { useSocket } from '../../../shared/hooks/useSocket';
import {
  NOTIFICATION_NEW_SOCKET_EVENT,
  NOTIFICATION_UNREAD_COUNT_SOCKET_EVENT,
  type INotificationEvent,
  type IUnreadCountEvent,
} from '@network/shared';

export const useNotificationSocket = (
  socket: ReturnType<typeof useSocket>
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (event: INotificationEvent) => {
      dispatch(
        notificationApi.util.updateQueryData(
          'getNotifications',
          NOTIFICATION_LIST_ARGS,
          (draft) => {
            const existingIndex = draft.data.findIndex(
              (item) => item.id === event.id
            );
            if (existingIndex !== -1) {
              draft.data.splice(existingIndex, 1);
            }
            draft.data.unshift(event);
          }
        )
      );
    };

    const handleUnreadCount = (event: IUnreadCountEvent) => {
      dispatch(
        notificationApi.util.updateQueryData(
          'getUnreadCount',
          undefined,
          (draft) => {
            draft.data.count = event.count;
          }
        )
      );
    };

    socket.on(NOTIFICATION_NEW_SOCKET_EVENT, handleNewNotification);
    socket.on(NOTIFICATION_UNREAD_COUNT_SOCKET_EVENT, handleUnreadCount);

    return () => {
      socket.off(NOTIFICATION_NEW_SOCKET_EVENT, handleNewNotification);
      socket.off(NOTIFICATION_UNREAD_COUNT_SOCKET_EVENT, handleUnreadCount);
    };
  }, [dispatch, socket]);
};
