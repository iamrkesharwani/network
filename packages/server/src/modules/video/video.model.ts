import mongoose, { Schema, Document } from 'mongoose';
import {
  VIDEO_CATEGORIES,
  VIDEO_VISIBILITY,
  VIDEO_STATUS,
  type IVideo,
} from '@network/shared';

export interface IVideoDocument
  extends Omit<IVideo, 'id' | 'userId'>, Document {
  userId: mongoose.Types.ObjectId;
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
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
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

export const VideoModel = mongoose.model<IVideoDocument>('Video', videoSchema);
