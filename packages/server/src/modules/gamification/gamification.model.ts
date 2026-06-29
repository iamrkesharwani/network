import mongoose, { Schema, type Document } from 'mongoose';
import { ACHIEVEMENT_IDS, type AchievementId } from '@network/shared';

export interface IUnlockedAchievementSubdoc {
  id: AchievementId;
  unlockedAt: Date;
}

export interface IGamificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  xp: number;
  uploadsCount: number;
  achievements: IUnlockedAchievementSubdoc[];
}

const unlockedAchievementSchema = new Schema<IUnlockedAchievementSubdoc>(
  {
    id: {
      type: String,
      enum: ACHIEVEMENT_IDS,
      required: true,
    },
    unlockedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  { _id: false }
);

const gamificationSchema = new Schema<IGamificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    uploadsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: {
      type: [unlockedAchievementSchema],
      default: [],
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
        delete json['userId'];
        return json;
      },
    },
  }
);

export const GamificationModel = mongoose.model<IGamificationDocument>(
  'Gamification',
  gamificationSchema
);
