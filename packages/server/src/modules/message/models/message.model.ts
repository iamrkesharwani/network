import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  MESSAGE_CIPHERTEXT_MAX_LENGTH,
  MESSAGE_IV_MAX_LENGTH,
  MESSAGE_ENCRYPTED_DATA_KEY_MAX_LENGTH,
  MESSAGE_REACTION_CIPHERTEXT_MAX_LENGTH,
  MESSAGE_ATTACHMENT_STORAGE_KEY_MAX_LENGTH,
  MESSAGE_ATTACHMENT_TYPES,
  type MessageAttachmentType,
} from '@network/shared';

export interface IMessageReactionEntry {
  userId: Types.ObjectId;
  ciphertext: string;
  iv: string;
  encryptedDataKey: string;
  createdAt: Date;
}

export interface IMessageDocument extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  ciphertext: string;
  iv: string;
  encryptedDataKey: string;
  reactions: IMessageReactionEntry[];
  replyToMessageId?: Types.ObjectId;
  attachmentStorageKey?: string;
  attachmentEncryptedDataKey?: string;
  attachmentIv?: string;
  attachmentType?: MessageAttachmentType;
  attachmentMimeType?: string;
  attachmentSize?: number;
  attachmentDuration?: number;
  deletedFor: Types.ObjectId[];
  unsentAt?: Date;
  editedAt?: Date;
  expiresAt?: Date;
  expiredAt?: Date;
  moderationRemovedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

const messageReactionEntrySchema = new Schema<IMessageReactionEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ciphertext: {
      type: String,
      required: true,
      maxlength: MESSAGE_REACTION_CIPHERTEXT_MAX_LENGTH,
    },
    iv: {
      type: String,
      required: true,
      maxlength: MESSAGE_IV_MAX_LENGTH,
    },
    encryptedDataKey: {
      type: String,
      required: true,
      maxlength: MESSAGE_ENCRYPTED_DATA_KEY_MAX_LENGTH,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ciphertext: {
      type: String,
      required: true,
      maxlength: MESSAGE_CIPHERTEXT_MAX_LENGTH,
    },
    iv: {
      type: String,
      required: true,
      maxlength: MESSAGE_IV_MAX_LENGTH,
    },
    encryptedDataKey: {
      type: String,
      required: true,
      maxlength: MESSAGE_ENCRYPTED_DATA_KEY_MAX_LENGTH,
    },
    reactions: {
      type: [messageReactionEntrySchema],
      default: [],
    },
    replyToMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    attachmentStorageKey: {
      type: String,
      maxlength: MESSAGE_ATTACHMENT_STORAGE_KEY_MAX_LENGTH,
    },
    attachmentEncryptedDataKey: {
      type: String,
      maxlength: MESSAGE_ENCRYPTED_DATA_KEY_MAX_LENGTH,
    },
    attachmentIv: {
      type: String,
      maxlength: MESSAGE_IV_MAX_LENGTH,
    },
    attachmentType: {
      type: String,
      enum: MESSAGE_ATTACHMENT_TYPES,
    },
    attachmentMimeType: {
      type: String,
    },
    attachmentSize: {
      type: Number,
    },
    attachmentDuration: {
      type: Number,
    },
    deletedFor: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    unsentAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
    },
    moderationRemovedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessageDocument>(
  'Message',
  messageSchema
);
