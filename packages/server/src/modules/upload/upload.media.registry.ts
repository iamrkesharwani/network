import type { MultipartMediaType } from '@network/shared';
import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  ALLOWED_SHORT_MIME_TYPES,
  MAX_SHORT_SIZE_BYTES,
} from '@network/shared';
import * as videoRepository from '../video/video.repository.js';
import * as shortRepository from '../short/short.repository.js';
import { videoProcessWebhook } from '../video/services/video.webhook.service.js';
import { shortProcessWebhook } from '../short/services/short.webhook.service.js';
import type { NormalizedWebhookPayload } from '../../core/providers/types.js';

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

  processReadyPayload(payload: NormalizedWebhookPayload): Promise<boolean>;
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

  processReadyPayload: videoProcessWebhook,
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

  processReadyPayload: shortProcessWebhook,
};

const registry: Record<MultipartMediaType, MultipartMediaAdapter> = {
  video: videoAdapter,
  short: shortAdapter,
};

export const getMediaAdapter = (
  mediaType: MultipartMediaType
): MultipartMediaAdapter => registry[mediaType];
