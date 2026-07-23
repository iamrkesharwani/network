import type { Socket } from 'socket.io';
import {
  CONVERSATION_ROOM_JOIN_EVENT,
  CONVERSATION_ROOM_LEAVE_EVENT,
  MESSAGE_TYPING_SOCKET_EVENT,
  conversationRoomEventSchema,
} from '@network/shared';
import { getIO } from '../../core/config/socket.js';
import { logger } from '../../core/utils/logger.js';
import * as conversationRepository from './repository/conversation.repository.js';
import * as presenceService from './services/presence.service.js';
import * as preferencesService from '../preferences/preferences.service.js';

const conversationRoomName = (conversationId: string): string =>
  `conversation:${conversationId}`;

const handleConnection = (socket: Socket): void => {
  const { id: userId } = socket.data.user;

  presenceService
    .handleUserConnected(userId)
    .catch((error) => logger.error(error, 'Failed to record presence connect'));

  socket.on(CONVERSATION_ROOM_JOIN_EVENT, async (payload) => {
    const parsed = conversationRoomEventSchema.safeParse(payload);
    if (!parsed.success) return;

    const isMember = await conversationRepository.isParticipant(
      userId,
      parsed.data.conversationId
    );
    if (!isMember) return;

    socket.join(conversationRoomName(parsed.data.conversationId));
  });

  socket.on(CONVERSATION_ROOM_LEAVE_EVENT, (payload) => {
    const parsed = conversationRoomEventSchema.safeParse(payload);
    if (!parsed.success) return;

    socket.leave(conversationRoomName(parsed.data.conversationId));
  });

  socket.on(MESSAGE_TYPING_SOCKET_EVENT, async (payload) => {
    const parsed = conversationRoomEventSchema.safeParse(payload);
    if (!parsed.success) return;

    const isMember = await conversationRepository.isParticipant(
      userId,
      parsed.data.conversationId
    );
    if (!isMember) return;

    const privacyByUserId = await preferencesService.getResolvedPrivacyByUserIds([
      userId,
    ]);
    if (!privacyByUserId.get(userId)?.typingIndicator) return;

    socket
      .to(conversationRoomName(parsed.data.conversationId))
      .emit(MESSAGE_TYPING_SOCKET_EVENT, {
        userId,
        conversationId: parsed.data.conversationId,
      });
  });

  socket.on('disconnect', () => {
    presenceService
      .handleUserDisconnected(userId)
      .catch((error) =>
        logger.error(error, 'Failed to record presence disconnect')
      );
  });
};

export const registerMessageSocketHandlers = (): void => {
  getIO().on('connection', handleConnection);
};
