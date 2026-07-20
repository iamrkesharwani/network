import mongoose, { Schema, type Document } from 'mongoose';
import {
  CONTENT_TYPES,
  CONTENT_MODEL_BY_TYPE,
  MODERATION_STATUS,
  COMMENT_TEXT_MAX_LENGTH,
  type ContentType,
  type ModerationStatus,
} from '@network/shared';

export interface ICommentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentType: ContentType;
  contentModel: 'Video' | 'Short' | 'Post';
  contentId: mongoose.Types.ObjectId;
  parentCommentId: mongoose.Types.ObjectId | null;
  text: string;
  likes: number;
  repliesCount: number;
  edited: boolean;
  deletedAt: Date | null;
  moderationStatus: ModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: CONTENT_TYPES,
      required: true,
    },
    contentModel: {
      type: String,
      enum: ['Video', 'Short', 'Post'],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'contentModel',
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: COMMENT_TEXT_MAX_LENGTH,
    },
    likes: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: MODERATION_STATUS,
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,

      transform(_doc, ret) {
        const json = ret as Record<string, any>;
        json['id'] = json['_id'].toString();
        delete json['_id'];
        delete json['__v'];

        const isDeleted = Boolean(json['deletedAt']);
        json['isDeleted'] = isDeleted;
        if (isDeleted) {
          json['text'] = '';
        }
        delete json['deletedAt'];

        if (json['parentCommentId']) {
          json['parentCommentId'] = json['parentCommentId'].toString();
        }

        const raw = json['userId'] as
          | {
              _id: mongoose.Types.ObjectId;
              username: string;
              avatarUrl?: string;
            }
          | mongoose.Types.ObjectId
          | string
          | undefined;

        const rawId =
          raw && typeof raw === 'object'
            ? '_id' in raw
              ? raw._id.toString()
              : 'id' in raw
                ? String((raw as { id: unknown }).id)
                : undefined
            : undefined;

        if (raw && typeof raw === 'object' && rawId && 'username' in raw) {
          json['author'] = {
            id: rawId,
            username: raw.username,
            ...(raw.avatarUrl !== undefined && {
              avatarUrl: raw.avatarUrl,
            }),
          };
        } else {
          throw new Error(
            `CommentDocument.toJSON: userId was not populated (got ${JSON.stringify(raw)}). ` +
              `Ensure all repository finders call .populate('userId', 'username avatarUrl').`
          );
        }
        delete json['userId'];
        return json;
      },
    },
  }
);

commentSchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType] as
    | 'Video'
    | 'Short'
    | 'Post';
});

commentSchema.index({
  contentType: 1,
  contentId: 1,
  parentCommentId: 1,
  _id: -1,
});
commentSchema.index({ moderationStatus: 1 });

export const CommentModel = mongoose.model<ICommentDocument>(
  'Comment',
  commentSchema
);
