import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  CONVERSATION_TYPES,
  GROUP_NAME_MAX_LENGTH,
  MESSAGE_GROUP_MAX_PARTICIPANTS,
  MESSAGE_DISAPPEARING_TTL_OPTIONS,
  type ConversationType,
  type ConversationDisappearingTtl,
} from '@network/shared';

export interface IConversationDocument extends Document {
  type: ConversationType;
  participantIds: Types.ObjectId[];
  directKey?: string | undefined;
  groupName?: string;
  groupAvatarUrl?: string;
  createdBy: Types.ObjectId;
  lastMessageAt: Date;
  lastReadAt: Map<string, Date>;
  mutedUntil: Map<string, Date>;
  archivedAt: Map<string, Date>;
  pinnedAt: Map<string, Date>;
  hiddenByBlockAt: Map<string, Date>;
  disappearingMessagesTtl: ConversationDisappearingTtl;
  createdAt: Date;
  updatedAt: Date;
}

const buildDirectKey = (participantIds: Types.ObjectId[]): string =>
  participantIds
    .map((id) => id.toString())
    .sort()
    .join('_');

const conversationSchema = new Schema<IConversationDocument>(
  {
    type: {
      type: String,
      enum: CONVERSATION_TYPES,
      required: true,
    },
    participantIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
    },
    directKey: {
      type: String,
    },
    groupName: {
      type: String,
      trim: true,
      maxlength: GROUP_NAME_MAX_LENGTH,
    },
    groupAvatarUrl: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: () => new Date(),
    },
    lastReadAt: {
      type: Map,
      of: Date,
      default: () => new Map(),
    },
    mutedUntil: {
      type: Map,
      of: Date,
      default: () => new Map(),
    },
    archivedAt: {
      type: Map,
      of: Date,
      default: () => new Map(),
    },
    pinnedAt: {
      type: Map,
      of: Date,
      default: () => new Map(),
    },
    hiddenByBlockAt: {
      type: Map,
      of: Date,
      default: () => new Map(),
    },
    disappearingMessagesTtl: {
      type: String,
      enum: MESSAGE_DISAPPEARING_TTL_OPTIONS,
      default: 'off',
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.pre('validate', function setDirectKey() {
  if (this.type === 'direct') {
    this.directKey = buildDirectKey(this.participantIds);
    if (this.participantIds.length !== 2) {
      this.invalidate(
        'participantIds',
        'A direct conversation needs exactly 2 participants.'
      );
    }
  } else {
    this.directKey = undefined;
    if (
      this.participantIds.length < 3 ||
      this.participantIds.length > MESSAGE_GROUP_MAX_PARTICIPANTS
    ) {
      this.invalidate(
        'participantIds',
        `A group needs 3 to ${MESSAGE_GROUP_MAX_PARTICIPANTS} participants.`
      );
    }
  }
});

conversationSchema.index({ directKey: 1 }, { unique: true, sparse: true });
conversationSchema.index({ participantIds: 1, lastMessageAt: -1 });

export const ConversationModel = mongoose.model<IConversationDocument>(
  'Conversation',
  conversationSchema
);
