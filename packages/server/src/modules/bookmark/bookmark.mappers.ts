import type { IBookmarkResponse } from '@network/shared';
import type { IBookmarkDocument } from './bookmark.model.js';

interface PopulatedContent {
  _id: { toString(): string };
  title: string;
  thumbnailUrl?: string;
  duration?: number;
}

export const toResponse = (doc: IBookmarkDocument): IBookmarkResponse | null => {
  const content = doc.contentId as unknown as PopulatedContent | null;
  if (!content || !content.title) return null;

  return {
    id: doc._id.toString(),
    contentType: doc.contentType,
    content: {
      id: content._id.toString(),
      title: content.title,
      ...(content.thumbnailUrl !== undefined && {
        thumbnailUrl: content.thumbnailUrl,
      }),
      ...(content.duration !== undefined && { duration: content.duration }),
    },
    savedAt: doc.createdAt.toISOString(),
  };
};
