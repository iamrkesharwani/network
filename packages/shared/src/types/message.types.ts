import { z } from 'zod';
import {
  messageSendSchema,
  groupCreateSchema,
  groupUpdateSchema,
} from '../schemas/message.schema.js';

export type MessageSendInput = z.infer<typeof messageSendSchema>;
export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;

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
  text?: string;
  sharedVideoId?: string;
  sharedShortId?: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}
