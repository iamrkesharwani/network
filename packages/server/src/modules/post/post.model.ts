import mongoose, { Schema, Document } from 'mongoose';
import {
  POST_VISIBILITY,
  POST_STATUS,
  POST_MEDIA_TYPE,
  POST_TEXT_MAX_LENGTH,
  MAX_POST_IMAGES,
  MODERATION_STATUS,
  TYPESENSE_COLLECTIONS,
  type IPost,
} from '@network/shared';
import { attachSearchTokenHooks } from '../../core/utils/attachSearchTokenHooks.js';
import { attachTypesenseSyncHooks } from '../../core/utils/attachTypesenseSyncHooks.js';

export interface IPostDocument
  extends
    Omit<
      IPost,
      'id' | 'userId' | 'deletedAt' | 'unlistedAt' | 'unlistedExpiryWarnedAt'
    >,
    Document {
  userId: mongoose.Types.ObjectId;
  deletedAt: Date | null;
  unlistedAt: Date | null;
  unlistedExpiryWarnedAt: Date | null;
  searchTokens: string[];
}

const postSchema = new Schema<IPostDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: POST_TEXT_MAX_LENGTH,
    },
    mediaType: {
      type: String,
      enum: POST_MEDIA_TYPE,
      default: 'none',
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_POST_IMAGES,
        message: `A post can have at most ${MAX_POST_IMAGES} images.`,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: POST_VISIBILITY,
      default: 'public',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: POST_STATUS,
      default: 'READY',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    unlistedAt: {
      type: Date,
      default: null,
    },
    unlistedExpiryWarnedAt: {
      type: Date,
      default: null,
    },
    searchTokens: {
      type: [String],
      default: [],
      select: false,
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
        delete json['deletedAt'];
        delete json['unlistedExpiryWarnedAt'];
        delete json['searchTokens'];

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
            `PostDocument.toJSON: userId was not populated (got ${JSON.stringify(raw)}). ` +
              `Ensure all repository finders call .populate('userId', 'username avatarUrl').`
          );
        }
        delete json['userId'];
        return json;
      },
    },
  }
);

postSchema.pre('validate', function () {
  const hasText = typeof this.text === 'string' && this.text.trim().length > 0;
  const hasMedia = this.mediaType !== 'none';

  if (!hasText && !hasMedia) {
    throw new Error('A post must contain text or an image.');
  }
});

postSchema.index({ status: 1, visibility: 1, _id: -1 });
postSchema.index({ userId: 1, status: 1, _id: -1 });
postSchema.index({ deletedAt: 1 });
postSchema.index({ visibility: 1, unlistedAt: 1 });
postSchema.index({ moderationStatus: 1 });
postSchema.index({ text: 'text', tags: 'text' });
postSchema.index({ searchTokens: 1 });

attachSearchTokenHooks(postSchema, ['text', 'tags']);

attachTypesenseSyncHooks(postSchema, {
  collection: TYPESENSE_COLLECTIONS.POST,
  isIndexable: (doc) =>
    doc.status === 'READY' &&
    doc.visibility === 'public' &&
    !doc.deletedAt &&
    !['jury_removed', 'admin_removed'].includes(doc.moderationStatus),
  toDocument: (doc) => ({
    text: doc.text ?? '',
    tags: doc.tags ?? [],
  }),
});

export const PostModel = mongoose.model<IPostDocument>('Post', postSchema);
