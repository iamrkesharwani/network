import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from '../utils/ApiError.js';
import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  MAX_SHORT_SIZE_BYTES,
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES,
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
            `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`
          )
        );
      }
    },
  });
};

export const verifyFileMagicBytes = async (
  file: Express.Multer.File,
  allowedMimeTypes: readonly string[]
): Promise<void> => {
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !allowedMimeTypes.includes(detected.mime)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `File content does not match declared type. Detected: ${detected?.mime ?? 'unknown'}`
    );
  }
};

export const uploadAvatar = createUploadMiddleware(
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES
).single('avatar');

export const uploadThumbnail = createUploadMiddleware(
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES
).single('thumbnail');

export const uploadVideo = createUploadMiddleware(
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES
).single('video');

export const uploadShort = createUploadMiddleware(
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_SHORT_SIZE_BYTES
).single('short');
