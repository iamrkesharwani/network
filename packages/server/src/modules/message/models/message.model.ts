import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  MESSAGE_CIPHERTEXT_MAX_LENGTH,
  MESSAGE_IV_MAX_LENGTH,
  MESSAGE_ENCRYPTED_KEY_MAX_LENGTH,
  MESSAGE_REACTION_CIPHERTEXT_MAX_LENGTH,
} from '@network/shared';

export interface IEncryptedKeyEntry {
  recipientId: Types.ObjectId;
  encryptedKey: string;
}

export interface IMessageReactionEntry {
  userId: Types.ObjectId;
  ciphertext: string;
  iv: string;
  encryptedKeys: IEncryptedKeyEntry[];
  createdAt: Date;
}

export interface IMessageDocument extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  ciphertext: string;
  iv: string;
  encryptedKeys: IEncryptedKeyEntry[];
  reactions: IMessageReactionEntry[];
  replyToMessageId?: Types.ObjectId;
  deletedFor: Types.ObjectId[];
  unsentAt?: Date;
  editedAt?: Date;
  expiresAt?: Date;
  expiredAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

const encryptedKeyEntrySchema = new Schema<IEncryptedKeyEntry>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    encryptedKey: {
      type: String,
      required: true,
      maxlength: MESSAGE_ENCRYPTED_KEY_MAX_LENGTH,
    },
  },
  { _id: false }
);

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
    encryptedKeys: {
      type: [encryptedKeyEntrySchema],
      required: true,
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
    encryptedKeys: {
      type: [encryptedKeyEntrySchema],
      required: true,
    },
    reactions: {
      type: [messageReactionEntrySchema],
      default: [],
    },
    replyToMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
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
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, 'encryptedKeys.recipientId': 1 });

export const MessageModel = mongoose.model<IMessageDocument>(
  'Message',
  messageSchema
);
