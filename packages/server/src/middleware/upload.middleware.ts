import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  MAX_SHORT_SIZE_BYTES,
} from '@network/shared';

const storage = multer.memoryStorage();

const createUploadMiddleware = (
  allowedMimeTypes: readonly string[],
  maxSizeBytes: number
) => {
  return multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            400,
            'VALIDATION_ERROR',
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
          )
        );
      }
    },
  });
};

export const uploadAvatar = createUploadMiddleware(
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES
).single('avatar');

export const uploadThumbnail = createUploadMiddleware(
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES
).single('thumbnail');

export const uploadVideo = createUploadMiddleware(
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES
).single('video');

export const uploadShort = createUploadMiddleware(
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_SHORT_SIZE_BYTES
).single('short');
