import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { fileTypeFromBuffer, fileTypeFromFile } from 'file-type';
import { ApiError } from '../utils/ApiError.js';
import {
  ALLOWED_VIDEO_MIME_TYPES,
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  MAX_SHORT_SIZE_BYTES,
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES,
} from '@network/shared';
import type { NextFunction, Request, Response } from 'express';

const memStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename: (_req, file, cb) => {
    const rand = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `upload-${rand}${ext}`);
  },
});

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

const createDiskUploadMiddleware = (
  allowedMimeTypes: readonly string[],
  maxSizeBytes: number
) =>
  multer({
    storage: diskStorage,
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

export const verifyFileMagicBytes = async (
  file: Express.Multer.File,
  allowedMimeTypes: readonly string[]
): Promise<void> => {
  const detected = file.buffer
    ? await fileTypeFromBuffer(file.buffer)
    : await fileTypeFromFile(file.path);

  if (!detected || !allowedMimeTypes.includes(detected.mime)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `File content does not match declared type. Detected: ${detected?.mime ?? 'unknown'}`
    );
  }
};

export const cleanupTempFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.on('finish', () => {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  });
  next();
};

export const uploadAvatar = createMemUploadMiddleware(
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES
).single('avatar');

export const uploadThumbnail = createMemUploadMiddleware(
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_SIZE_BYTES
).single('thumbnail');

export const uploadShort = createDiskUploadMiddleware(
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_SHORT_SIZE_BYTES
).single('short');
