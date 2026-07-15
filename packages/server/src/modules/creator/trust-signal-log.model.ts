import mongoose, { Schema, type Document } from 'mongoose';

export interface ITrustSignalLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  signalType: string;
  rawWeight: number;
  multiplier: number;
  appliedPoints: number;
  createdAt: Date;
}

const trustSignalLogSchema = new Schema<ITrustSignalLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    signalType: {
      type: String,
      required: true,
    },
    rawWeight: {
      type: Number,
      required: true,
    },
    multiplier: {
      type: Number,
      required: true,
      default: 1,
    },
    appliedPoints: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

trustSignalLogSchema.index({ userId: 1, signalType: 1, createdAt: -1 });
trustSignalLogSchema.index({ userId: 1, createdAt: -1 });

export const TrustSignalLogModel = mongoose.model<ITrustSignalLogDocument>(
  'TrustSignalLog',
  trustSignalLogSchema
);
