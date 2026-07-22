import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from '../utils/ApiError.js';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_BANNER_MIME_TYPES,
  MAX_BANNER_SIZE_BYTES,
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES,
  ALLOWED_POST_IMAGE_MIME_TYPES,
  MAX_POST_IMAGE_SIZE_BYTES,
  MAX_POST_IMAGES,
  ALLOWED_CAPTION_MIME_TYPES,
  MAX_CAPTION_SIZE_BYTES,
  ALLOWED_PLAYLIST_COVER_MIME_TYPES,
  MAX_PLAYLIST_COVER_SIZE_BYTES,
} from '@network/shared';

const memStorage = multer.memoryStorage();

const createMemUploadMiddleware = (
  allowedMimeTypes: readonly string[],
  maxSizeBytes: number
) => {
  return multer({
    storage: memStorage,
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

export const uploadAvatar = createMemUploadMiddleware(
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES
).single('avatar');

export const uploadBanner = createMemUploadMiddleware(
  ALLOWED_BANNER_MIME_TYPES,
  MAX_BANNER_SIZE_BYTES
).single('banner');

export const uploadThumbnail = createMemUploadMiddleware(
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES
).single('thumbnail');

export const uploadPostImages = createMemUploadMiddleware(
  ALLOWED_POST_IMAGE_MIME_TYPES,
  MAX_POST_IMAGE_SIZE_BYTES
).array('images', MAX_POST_IMAGES);

export const uploadCaption = createMemUploadMiddleware(
  ALLOWED_CAPTION_MIME_TYPES,
  MAX_CAPTION_SIZE_BYTES
).single('caption');

export const uploadPlaylistCover = createMemUploadMiddleware(
  ALLOWED_PLAYLIST_COVER_MIME_TYPES,
  MAX_PLAYLIST_COVER_SIZE_BYTES
).single('cover');

export const uploadGroupAvatar = createMemUploadMiddleware(
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES
).single('avatar');
