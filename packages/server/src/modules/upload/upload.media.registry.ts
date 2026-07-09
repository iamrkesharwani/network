import type { MultipartMediaType } from '@network/shared';
import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  ALLOWED_SHORT_MIME_TYPES,
  MAX_SHORT_SIZE_BYTES,
  ALLOWED_POST_VIDEO_MIME_TYPES,
  MAX_POST_VIDEO_SIZE_BYTES,
} from '@network/shared';
import * as videoRepository from '../video/video.repository.js';
import * as shortRepository from '../short/short.repository.js';
import * as postRepository from '../post/post.repository.js';

export interface MultipartPlaceholder {
  id: string;
  ingestFileName: string;
}

export interface MultipartMediaAdapter {
  allowedMimeTypes: readonly string[];
  maxSizeBytes: number;

  createPlaceholder(
    userId: string,
    fileName: string
  ): Promise<MultipartPlaceholder>;

  findPlaceholder(id: string): Promise<MultipartPlaceholder | null>;

  markProcessing(
    id: string,
    data: { providerVideoId: string; storageKey: string }
  ): Promise<boolean>;

  markFailed(id: string, errorMessage: string): Promise<boolean>;

  deletePlaceholder(id: string): Promise<void>;
}

const videoAdapter: MultipartMediaAdapter = {
  allowedMimeTypes: ALLOWED_VIDEO_MIME_TYPES,
  maxSizeBytes: MAX_VIDEO_SIZE_BYTES,

  createPlaceholder: async (userId, fileName) => {
    const placeholder = await videoRepository.createPlaceholder(
      userId,
      fileName
    );
    return {
      id: placeholder._id.toString(),
      ingestFileName: placeholder.title,
    };
  },

  findPlaceholder: async (id) => {
    const doc = await videoRepository.findById(id);
    if (!doc) return null;
    return { id, ingestFileName: doc.title };
  },

  markProcessing: async (id, data) => {
    const updated = await videoRepository.updateById(id, {
      providerVideoId: data.providerVideoId,
      storageKey: data.storageKey,
      status: 'PROCESSING',
    });
    return !!updated;
  },

  markFailed: async (id, errorMessage) => {
    const updated = await videoRepository.updateById(id, {
      status: 'FAILED',
      errorMessage,
    });
    return !!updated;
  },

  deletePlaceholder: async (id) => {
    await videoRepository.deleteById(id);
  },
};

const shortAdapter: MultipartMediaAdapter = {
  allowedMimeTypes: ALLOWED_SHORT_MIME_TYPES,
  maxSizeBytes: MAX_SHORT_SIZE_BYTES,

  createPlaceholder: async (userId, fileName) => {
    const placeholder = await shortRepository.createPlaceholder(
      userId,
      fileName
    );
    return {
      id: placeholder._id.toString(),
      ingestFileName: placeholder.title,
    };
  },

  findPlaceholder: async (id) => {
    const doc = await shortRepository.findById(id);
    if (!doc) return null;
    return { id, ingestFileName: doc.title };
  },

  markProcessing: async (id, data) => {
    const updated = await shortRepository.updateById(id, {
      providerVideoId: data.providerVideoId,
      storageKey: data.storageKey,
      status: 'PROCESSING',
    });
    return !!updated;
  },

  markFailed: async (id, errorMessage) => {
    const updated = await shortRepository.updateById(id, {
      status: 'FAILED',
      errorMessage,
    });
    return !!updated;
  },

  deletePlaceholder: async (id) => {
    await shortRepository.deleteById(id);
  },
};

const postAdapter: MultipartMediaAdapter = {
  allowedMimeTypes: ALLOWED_POST_VIDEO_MIME_TYPES,
  maxSizeBytes: MAX_POST_VIDEO_SIZE_BYTES,

  createPlaceholder: async (userId, fileName) => {
    const placeholder = await postRepository.createVideoPlaceholder(userId);
    return { id: placeholder._id.toString(), ingestFileName: fileName };
  },

  findPlaceholder: async (id) => {
    const doc = await postRepository.findById(id);
    if (!doc) return null;
    return { id, ingestFileName: `post-${id}` };
  },

  markProcessing: async (id, data) => {
    const updated = await postRepository.updateById(id, {
      providerVideoId: data.providerVideoId,
      storageKey: data.storageKey,
      status: 'PROCESSING',
    });
    return !!updated;
  },

  markFailed: async (id, errorMessage) => {
    const updated = await postRepository.updateById(id, {
      status: 'FAILED',
      errorMessage,
    });
    return !!updated;
  },

  deletePlaceholder: async (id) => {
    await postRepository.deleteById(id);
  },
};

const registry: Record<MultipartMediaType, MultipartMediaAdapter> = {
  video: videoAdapter,
  short: shortAdapter,
  post: postAdapter,
};

export const getMediaAdapter = (
  mediaType: MultipartMediaType
): MultipartMediaAdapter => registry[mediaType];
