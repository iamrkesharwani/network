import mongoose from 'mongoose';
import type { IHistoryResponse } from '@network/shared';
import { HISTORY_COMPLETED_THRESHOLD } from '@network/shared';
import type { IHistoryDocument } from '../history.model.js';

interface PopulatedContent {
  _id: mongoose.Types.ObjectId;
  title: string;
  thumbnailUrl?: string;
  duration: number;
}

export const toResponse = (doc: IHistoryDocument): IHistoryResponse | null => {
  const content = doc.contentId as unknown as PopulatedContent | null;
  if (!content || !content.title) return null;

  const duration = doc.duration ?? content.duration;
  const progressPercent =
    duration && duration > 0 ? Math.min(1, doc.currentTime / duration) : 0;

  return {
    id: doc._id.toString(),
    contentType: doc.contentType,
    content: {
      id: content._id.toString(),
      title: content.title,
      ...(content.thumbnailUrl !== undefined && {
        thumbnailUrl: content.thumbnailUrl,
      }),
      duration: content.duration,
    },
    currentTime: doc.currentTime,
    ...(doc.duration !== undefined && { duration: doc.duration }),
    progressPercent,
    completed: progressPercent >= HISTORY_COMPLETED_THRESHOLD,
    lastWatchedAt: doc.updatedAt.toISOString(),
  };
};
