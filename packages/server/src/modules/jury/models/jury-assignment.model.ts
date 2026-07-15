import mongoose, { Schema, type Document } from 'mongoose';
import { JURY_VOTE_CHOICES, type JuryVoteChoice } from '@network/shared';

export interface IJuryAssignmentDocument extends Document {
  caseId: mongoose.Types.ObjectId;
  jurorId: mongoose.Types.ObjectId;
  assignedAt: Date;
  vote: JuryVoteChoice | null;
  votedAt: Date | null;
}

const juryAssignmentSchema = new Schema<IJuryAssignmentDocument>({
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'JuryCase',
    required: true,
  },
  jurorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAt: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
  vote: {
    type: String,
    enum: JURY_VOTE_CHOICES,
    default: null,
  },
  votedAt: {
    type: Date,
    default: null,
  },
});

juryAssignmentSchema.index({ caseId: 1, jurorId: 1 }, { unique: true });
juryAssignmentSchema.index({ jurorId: 1, votedAt: 1 });

export const JuryAssignmentModel = mongoose.model<IJuryAssignmentDocument>(
  'JuryAssignment',
  juryAssignmentSchema
);
