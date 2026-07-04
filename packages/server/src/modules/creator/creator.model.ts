import mongoose, { Schema, type Document } from 'mongoose';
import {
  BADGE_IDS,
  VIDEO_MILESTONE_IDS,
  CREATOR_MILESTONE_IDS,
  TRUST_FEATURE_IDS,
  type BadgeId,
  type VideoMilestoneId,
  type CreatorMilestoneId,
} from '@network/shared';

export interface IBadgeSubdoc {
  id: BadgeId;
  unlockedAt: Date;
}

export interface IVideoMilestoneSubdoc {
  videoId: mongoose.Types.ObjectId;
  id: VideoMilestoneId;
  unlockedAt: Date;
}

export interface ICreatorMilestoneSubdoc {
  id: CreatorMilestoneId;
  unlockedAt: Date;
}

export interface ICreatorDocument extends Document {
  userId: mongoose.Types.ObjectId;
  trustScore: number;
  totalViews: number;
  publishCount: number;
  videoPublishCount: number;
  shortPublishCount: number;
  unlockedFeatures: string[];
  badges: IBadgeSubdoc[];
  videoMilestones: IVideoMilestoneSubdoc[];
  creatorMilestones: ICreatorMilestoneSubdoc[];
  uploadActivity: Date[];
}

const badgeSchema = new Schema<IBadgeSubdoc>(
  {
    id: { type: String, enum: BADGE_IDS, required: true },
    unlockedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const videoMilestoneSchema = new Schema<IVideoMilestoneSubdoc>(
  {
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    id: { type: String, enum: VIDEO_MILESTONE_IDS, required: true },
    unlockedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const creatorMilestoneSchema = new Schema<ICreatorMilestoneSubdoc>(
  {
    id: { type: String, enum: CREATOR_MILESTONE_IDS, required: true },
    unlockedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const creatorSchema = new Schema<ICreatorDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    trustScore: { type: Number, default: 0, min: 0 },
    totalViews: { type: Number, default: 0, min: 0 },
    publishCount: { type: Number, default: 0, min: 0 },
    videoPublishCount: { type: Number, default: 0, min: 0 },
    shortPublishCount: { type: Number, default: 0, min: 0 },
    unlockedFeatures: {
      type: [String],
      enum: TRUST_FEATURE_IDS,
      default: [],
    },
    badges: { type: [badgeSchema], default: [] },
    videoMilestones: { type: [videoMilestoneSchema], default: [] },
    creatorMilestones: { type: [creatorMilestoneSchema], default: [] },
    uploadActivity: { type: [Date], default: [] },
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
        delete json['userId'];
        delete json['trustScore'];
        return json;
      },
    },
  }
);

export const CreatorModel = mongoose.model<ICreatorDocument>(
  'Creator',
  creatorSchema
);
