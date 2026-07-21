import type {
  IPlaylistAuthor,
  IPlaylistDetail,
  IPlaylistItemResponse,
  IPlaylistSummary,
} from '@network/shared';
import type { IPlaylistDocument } from '../playlist.model.js';
import type { IPlaylistItemDocument } from '../playlistItem.model.js';
import type { PopulatedAuthor } from '../repository/playlist.repository.js';

interface PopulatedContent {
  _id: { toString(): string };
  title: string;
  thumbnailUrl?: string;
  duration: number;
}

export const toPlaylistSummary = (
  doc: IPlaylistDocument,
  fallbackThumbnailUrl?: string
): IPlaylistSummary => {
  const hasCustomCover = doc.coverImageUrl !== undefined;
  const thumbnailUrl = doc.coverImageUrl ?? fallbackThumbnailUrl;

  return {
    id: doc._id.toString(),
    title: doc.title,
    ...(doc.description !== undefined && { description: doc.description }),
    visibility: doc.visibility,
    itemCount: doc.itemCount,
    ...(thumbnailUrl !== undefined && { thumbnailUrl }),
    hasCustomCover,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const toPlaylistDetail = (
  doc: IPlaylistDocument,
  fallbackThumbnailUrl?: string
): IPlaylistDetail => {
  const author = doc.userId as unknown as PopulatedAuthor;
  const authorResponse: IPlaylistAuthor = {
    id: author._id.toString(),
    username: author.username,
  };

  return {
    ...toPlaylistSummary(doc, fallbackThumbnailUrl),
    userId: author._id.toString(),
    author: authorResponse,
  };
};

export const toItemResponse = (
  doc: IPlaylistItemDocument
): IPlaylistItemResponse | null => {
  const content = doc.contentId as unknown as PopulatedContent | null;
  if (!content || !content.title) return null;

  return {
    id: doc._id.toString(),
    position: doc.position,
    contentType: doc.contentType,
    content: {
      id: content._id.toString(),
      title: content.title,
      ...(content.thumbnailUrl !== undefined && {
        thumbnailUrl: content.thumbnailUrl,
      }),
      duration: content.duration,
    },
    addedAt: doc.createdAt.toISOString(),
  };
};
