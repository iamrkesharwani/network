import { useEffect } from 'react';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { conversationApi, CONVERSATION_LIST_ARGS } from '../conversationApi';
import { messageApi } from '../messageApi';
import type { useSocket } from '../../../shared/hooks/useSocket';
import {
  MESSAGE_THREAD_PAGE_LIMIT,
  MESSAGE_NEW_SOCKET_EVENT,
  CONVERSATION_UPDATED_SOCKET_EVENT,
  CONVERSATION_READ_SOCKET_EVENT,
  MESSAGE_DELETED_SOCKET_EVENT,
  MESSAGE_REACTION_UPDATED_SOCKET_EVENT,
  MESSAGE_EDITED_SOCKET_EVENT,
  MESSAGE_EXPIRED_SOCKET_EVENT,
  PRESENCE_ONLINE_SOCKET_EVENT,
  PRESENCE_OFFLINE_SOCKET_EVENT,
  type IMessageEvent,
  type IConversationUpdatedEvent,
  type IConversationReadEvent,
  type IMessageDeletedEvent,
  type IMessageReactionEvent,
  type IMessageEditedEvent,
  type IMessageExpiredEvent,
  type IPresenceEvent,
  type IParticipantSummary,
} from '@network/shared';

const patchParticipantPresence = (
  participant: IParticipantSummary,
  event: IPresenceEvent
): IParticipantSummary =>
  participant.id === event.userId
    ? {
        ...participant,
        isOnline: event.isOnline,
        ...(event.lastActiveAt && { lastActiveAt: event.lastActiveAt }),
      }
    : participant;

export const useMessageSocket = (socket: ReturnType<typeof useSocket>): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleMessageNew = (event: IMessageEvent) => {
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: event.conversationId, limit: MESSAGE_THREAD_PAGE_LIMIT },
          (draft) => {
            if (draft.data.some((message) => message.id === event.id)) return;
            draft.data.unshift(event);
          }
        )
      );
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: event.conversationId, limit: 1 },
          (draft) => {
            draft.data = [event];
          }
        )
      );
    };

    const handleConversationUpdated = (event: IConversationUpdatedEvent) => {
      dispatch(
        conversationApi.util.updateQueryData(
          'getConversations',
          CONVERSATION_LIST_ARGS,
          (draft) => {
            const index = draft.data.findIndex((item) => item.id === event.id);
            if (index !== -1) {
              draft.data.splice(index, 1);
            }
            draft.data.unshift(event);
          }
        )
      );
    };

    const handleConversationRead = (event: IConversationReadEvent) => {
      dispatch(
        conversationApi.util.updateQueryData(
          'getConversations',
          CONVERSATION_LIST_ARGS,
          (draft) => {
            const item = draft.data.find((c) => c.id === event.conversationId);
            if (item) item.isUnread = false;
          }
        )
      );
    };

    const handleMessageDeleted = (event: IMessageDeletedEvent) => {
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: event.conversationId, limit: MESSAGE_THREAD_PAGE_LIMIT },
          (draft) => {
            if (event.scope === 'me') {
              draft.data = draft.data.filter((m) => m.id !== event.messageId);
              return;
            }
            const message = draft.data.find((m) => m.id === event.messageId);
            if (message) {
              message.content = '';
              message.unsentAt = new Date().toISOString();
            }
          }
        )
      );
    };

    const handleMessageReaction = (event: IMessageReactionEvent) => {
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: event.conversationId, limit: MESSAGE_THREAD_PAGE_LIMIT },
          (draft) => {
            const message = draft.data.find((m) => m.id === event.messageId);
            if (!message) return;
            const withoutUser = message.reactions.filter(
              (reaction) => reaction.userId !== event.userId
            );
            message.reactions = event.reaction
              ? [...withoutUser, event.reaction]
              : withoutUser;
          }
        )
      );
    };

    const handleMessageEdited = (event: IMessageEditedEvent) => {
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: event.conversationId, limit: MESSAGE_THREAD_PAGE_LIMIT },
          (draft) => {
            const message = draft.data.find((m) => m.id === event.messageId);
            if (!message) return;
            message.content = event.content;
            message.editedAt = event.editedAt;
          }
        )
      );
    };

    const handleMessageExpired = (event: IMessageExpiredEvent) => {
      dispatch(
        messageApi.util.updateQueryData(
          'getMessages',
          { conversationId: event.conversationId, limit: MESSAGE_THREAD_PAGE_LIMIT },
          (draft) => {
            const message = draft.data.find((m) => m.id === event.messageId);
            if (!message) return;
            message.content = '';
            message.reactions = [];
            message.expiredAt = event.expiredAt;
          }
        )
      );
    };

    const handlePresence = (event: IPresenceEvent) => {
      dispatch(
        conversationApi.util.updateQueryData(
          'getConversations',
          CONVERSATION_LIST_ARGS,
          (draft) => {
            for (const conversation of draft.data) {
              if (conversation.type === 'direct') {
                conversation.otherParticipant = patchParticipantPresence(
                  conversation.otherParticipant,
                  event
                );
              } else {
                conversation.participants = conversation.participants.map(
                  (participant) => patchParticipantPresence(participant, event)
                );
              }
            }
          }
        )
      );
    };

    socket.on(MESSAGE_NEW_SOCKET_EVENT, handleMessageNew);
    socket.on(CONVERSATION_UPDATED_SOCKET_EVENT, handleConversationUpdated);
    socket.on(CONVERSATION_READ_SOCKET_EVENT, handleConversationRead);
    socket.on(MESSAGE_DELETED_SOCKET_EVENT, handleMessageDeleted);
    socket.on(MESSAGE_REACTION_UPDATED_SOCKET_EVENT, handleMessageReaction);
    socket.on(MESSAGE_EDITED_SOCKET_EVENT, handleMessageEdited);
    socket.on(MESSAGE_EXPIRED_SOCKET_EVENT, handleMessageExpired);
    socket.on(PRESENCE_ONLINE_SOCKET_EVENT, handlePresence);
    socket.on(PRESENCE_OFFLINE_SOCKET_EVENT, handlePresence);

    return () => {
      socket.off(MESSAGE_NEW_SOCKET_EVENT, handleMessageNew);
      socket.off(CONVERSATION_UPDATED_SOCKET_EVENT, handleConversationUpdated);
      socket.off(CONVERSATION_READ_SOCKET_EVENT, handleConversationRead);
      socket.off(MESSAGE_DELETED_SOCKET_EVENT, handleMessageDeleted);
      socket.off(MESSAGE_REACTION_UPDATED_SOCKET_EVENT, handleMessageReaction);
      socket.off(MESSAGE_EDITED_SOCKET_EVENT, handleMessageEdited);
      socket.off(MESSAGE_EXPIRED_SOCKET_EVENT, handleMessageExpired);
      socket.off(PRESENCE_ONLINE_SOCKET_EVENT, handlePresence);
      socket.off(PRESENCE_OFFLINE_SOCKET_EVENT, handlePresence);
    };
  }, [dispatch, socket]);
};
