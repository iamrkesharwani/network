import mongoose, { Schema, Document } from 'mongoose';
import {
  VIDEO_CATEGORIES,
  VIDEO_VISIBILITY,
  VIDEO_STATUS,
  VIDEO_TITLE_MAX_LENGTH,
  VIDEO_DESCRIPTION_MAX_LENGTH,
  CAPTION_LABEL_MAX_LENGTH,
  type IVideo,
} from '@network/shared';
import { attachSearchTokenHooks } from '../../core/utils/attachSearchTokenHooks.js';

const captionSchema = new Schema(
  {
    language: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
      maxlength: CAPTION_LABEL_MAX_LENGTH,
    },
    url: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      select: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        const json = ret as Record<string, any>;
        json['id'] = json['_id'].toString();
        delete json['_id'];
        delete json['storageKey'];
        return json;
      },
    },
  }
);

export interface ICaptionSubdocument {
  _id: mongoose.Types.ObjectId;
  language: string;
  label: string;
  url: string;
  storageKey: string;
  isDefault: boolean;
}

export interface IVideoDocument
  extends
    Omit<
      IVideo,
      | 'id'
      | 'userId'
      | 'deletedAt'
      | 'unlistedAt'
      | 'unlistedExpiryWarnedAt'
      | 'captions'
    >,
    Document {
  userId: mongoose.Types.ObjectId;
  deletedAt: Date | null;
  unlistedAt: Date | null;
  unlistedExpiryWarnedAt: Date | null;
  captions: mongoose.Types.DocumentArray<ICaptionSubdocument>;
  searchTokens: string[];
}

const videoSchema = new Schema<IVideoDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: VIDEO_TITLE_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: VIDEO_DESCRIPTION_MAX_LENGTH,
    },
    thumbnailUrl: {
      type: String,
    },
    providerVideoId: {
      type: String,
      sparse: true,
      unique: true,
    },
    playbackUrl: {
      type: String,
    },
    category: {
      type: String,
      enum: VIDEO_CATEGORIES,
      required: true,
      default: 'OTHER',
    },
    tags: {
      type: [String],
      default: [],
    },
    captions: {
      type: [captionSchema],
      default: [],
    },
    visibility: {
      type: String,
      enum: VIDEO_VISIBILITY,
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
    duration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: VIDEO_STATUS,
      default: 'UPLOADING',
    },
    errorMessage: {
      type: String,
    },
    storageKey: {
      type: String,
      sparse: true,
      select: false,
    },
    metricsRecorded: {
      type: Boolean,
      default: false,
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
        delete json['providerVideoId'];
        delete json['storageKey'];
        delete json['metricsRecorded'];
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
            `VideoDocument['userId]: userId was not populated (got ${JSON.stringify(raw)}). ` +
              `Ensure all repository finders call .populate('userId', 'username avatarUrl').`
          );
        }
        delete json['userId'];
        return json;
      },
    },
  }
);

videoSchema.index({
  status: 1,
  visibility: 1,
  _id: -1,
});

videoSchema.index({
  userId: 1,
  status: 1,
  _id: -1,
});

videoSchema.index({ deletedAt: 1 });
videoSchema.index({ visibility: 1, unlistedAt: 1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ searchTokens: 1 });

attachSearchTokenHooks(videoSchema, ['title', 'description', 'tags']);

export const VideoModel = mongoose.model<IVideoDocument>('Video', videoSchema);
