import mongoose, { Schema, type Document } from 'mongoose';
import {
  REPORTABLE_CONTENT_TYPES,
  REPORT_REASON_CODES,
  REPORT_STATUS,
  REPORT_NOTE_MAX_LENGTH,
  CONTENT_MODEL_BY_TYPE,
  type ReportableContentType,
  type ReportReasonCode,
  type ReportStatus,
} from '@network/shared';

export interface IReportDocument extends Document {
  reporterId: mongoose.Types.ObjectId;
  contentType: ReportableContentType;
  contentModel: 'Video' | 'Short' | 'Post' | 'Comment';
  contentId: mongoose.Types.ObjectId;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReportDocument>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: REPORTABLE_CONTENT_TYPES,
      required: true,
    },
    contentModel: {
      type: String,
      enum: ['Video', 'Short', 'Post', 'Comment'],
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
      required: true,
    },
    status: {
      type: String,
      enum: REPORT_STATUS,
      default: 'pending',
    },
    note: {
      type: String,
      trim: true,
      maxlength: REPORT_NOTE_MAX_LENGTH,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType];
});

reportSchema.index(
  { reporterId: 1, contentType: 1, contentId: 1 },
  { unique: true }
);
reportSchema.index({ contentType: 1, contentId: 1, status: 1 });
reportSchema.index({ reporterId: 1, createdAt: -1 });

export const ReportModel = mongoose.model<IReportDocument>(
  'Report',
  reportSchema
);
