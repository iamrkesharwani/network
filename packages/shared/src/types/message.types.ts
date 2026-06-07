import { z } from 'zod';
import {
  messageSendSchema,
  groupCreateSchema,
  groupUpdateSchema,
  MESSAGE_TYPES,
} from '../schemas/message.schema.js';

export type MessageSendInput = z.infer<typeof messageSendSchema>;
export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export interface IConversation {
  id: string;
  isGroup: boolean;
  name?: string;
  adminId?: string;
  participantIds: string[];
  lastMessageId?: string;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: MessageType;
  ciphertext: string;
  iv: string;
  encryptedKeys: Record<string, string>;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}
