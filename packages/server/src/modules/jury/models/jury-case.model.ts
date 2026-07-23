import mongoose, { Schema, type Document } from 'mongoose';
import {
  REPORTABLE_CONTENT_TYPES,
  REPORT_REASON_CODES,
  REPORT_CONTENT_MODEL_BY_TYPE,
  JURY_CASE_STATUS,
  JURY_VERDICT,
  JURY_POOL_SIZE,
  JURY_CONSENSUS_THRESHOLD,
  JURY_CASE_TIMEOUT_MS,
  type ReportableContentType,
  type ReportContentModel,
  type ReportReasonCode,
  type JuryCaseStatus,
  type JuryVerdict,
} from '@network/shared';

export interface IJuryCaseDocument extends Document {
  contentType: ReportableContentType;
  contentModel: ReportContentModel;
  contentId: mongoose.Types.ObjectId;
  reasonCode: ReportReasonCode | null;
  status: JuryCaseStatus;
  verdict: JuryVerdict | null;
  poolSize: number;
  consensusThreshold: number;
  deadline: Date;
  resolvedAt: Date | null;
  isAppeal: boolean;
  appealOfCaseId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const juryCaseSchema = new Schema<IJuryCaseDocument>(
  {
    contentType: {
      type: String,
      enum: REPORTABLE_CONTENT_TYPES,
      required: true,
    },
    contentModel: {
      type: String,
      enum: ['Video', 'Short', 'Post', 'Comment', 'Message', 'Conversation'],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'contentModel',
    },
    reasonCode: {
      type: String,
      enum: REPORT_REASON_CODES,
      default: null,
    },
    status: {
      type: String,
      enum: JURY_CASE_STATUS,
      default: 'open',
    },
    verdict: {
      type: String,
      enum: JURY_VERDICT,
      default: null,
    },
    poolSize: {
      type: Number,
      default: JURY_POOL_SIZE,
    },
    consensusThreshold: {
      type: Number,
      default: JURY_CONSENSUS_THRESHOLD,
    },
    deadline: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + JURY_CASE_TIMEOUT_MS),
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isAppeal: {
      type: Boolean,
      default: false,
    },
    appealOfCaseId: {
      type: Schema.Types.ObjectId,
      ref: 'JuryCase',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

juryCaseSchema.pre('validate', function setContentModel() {
  this.contentModel = REPORT_CONTENT_MODEL_BY_TYPE[this.contentType];
});

juryCaseSchema.index({ contentType: 1, contentId: 1, status: 1 });
juryCaseSchema.index({ status: 1, deadline: 1 });

export const JuryCaseModel = mongoose.model<IJuryCaseDocument>(
  'JuryCase',
  juryCaseSchema
);
