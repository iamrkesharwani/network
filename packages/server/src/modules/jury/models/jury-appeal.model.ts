import mongoose, { Schema, type Document } from 'mongoose';
import { APPEAL_STATUS, type AppealStatus } from '@network/shared';

export interface IJuryAppealDocument extends Document {
  caseId: mongoose.Types.ObjectId;
  appealCaseId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  reason: string;
  status: AppealStatus;
  resolvedAt: Date | null;
  resolvedBy: mongoose.Types.ObjectId | null;
  resolutionNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const juryAppealSchema = new Schema<IJuryAppealDocument>(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'JuryCase',
      required: true,
    },
    appealCaseId: {
      type: Schema.Types.ObjectId,
      ref: 'JuryCase',
      required: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: APPEAL_STATUS,
      default: 'pending',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

juryAppealSchema.index({ caseId: 1 }, { unique: true });
juryAppealSchema.index({ requesterId: 1, createdAt: -1 });

export const JuryAppealModel = mongoose.model<IJuryAppealDocument>(
  'JuryAppeal',
  juryAppealSchema
);
