import { z } from 'zod';
import {
  initiateMultipartUploadSchema,
  resumeMultipartUploadSchema,
  multipartSessionIdParamSchema,
  presignPartParamSchema,
  completeMultipartUploadSchema,
  abortMultipartUploadSchema,
  mediaIdParamSchema,
} from '../schemas/upload.schema.js';
import { MULTIPART_MEDIA_TYPES } from '../constants/upload.constants.js';

export type MultipartMediaType = (typeof MULTIPART_MEDIA_TYPES)[number];

export type InitiateMultipartUploadInput = z.infer<
  typeof initiateMultipartUploadSchema
>;
export type ResumeMultipartUploadInput = z.infer<
  typeof resumeMultipartUploadSchema
>;
export type MultipartSessionIdParam = z.infer<
  typeof multipartSessionIdParamSchema
>;
export type PresignPartParam = z.infer<typeof presignPartParamSchema>;
export type CompleteMultipartUploadInput = z.infer<
  typeof completeMultipartUploadSchema
>;
export type AbortMultipartUploadInput = z.infer<
  typeof abortMultipartUploadSchema
>;
export type MediaIdParam = z.infer<typeof mediaIdParamSchema>;

export type MultipartSessionStatus = 'active' | 'completed' | 'aborted';

export interface UploadPart {
  partNumber: number;
  size: number;
  etag?: string;
}

export interface IMultipartUploadSession {
  sessionId: string;
  userId: string;
  mediaType: MultipartMediaType;
  mediaId: string;
  storageKey: string;
  providerUploadId: string;
  partSize: number;
  totalParts: number;
  fileSizeBytes: number;
  fingerprint: string;
  parts: UploadPart[];
  status: MultipartSessionStatus;
}

export interface IInitiateMultipartUploadResult {
  sessionId: string;
  mediaId: string;
  storageKey: string;
  partSize: number;
  totalParts: number;
}

export interface IResumeMultipartUploadResult {
  sessionId: string;
  mediaId: string;
  storageKey: string;
  partSize: number;
  totalParts: number;
  fileSizeBytes: number;
  uploadedParts: { partNumber: number; etag: string }[];
}

export interface IPresignPartResultDirect {
  scheme: 'direct';
  partNumber: number;
  uploadUrl: string;
}

export interface IPresignPartResultBlockBlob {
  scheme: 'block-blob';
  partNumber: number;
  uploadUrl: string;
  blockId: string;
}

export type IPresignPartResult =
  | IPresignPartResultDirect
  | IPresignPartResultBlockBlob;

export interface ICompleteMultipartUploadResult {
  mediaId: string;
  storageKey: string;
}

export interface IPersistedUploadPointer {
  mediaType: MultipartMediaType;
  sessionId: string;
  mediaId: string;
  fingerprint: string;
  storageKey: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedParts: { partNumber: number; etag: string }[];
  totalParts: number;
  step: string;
}
