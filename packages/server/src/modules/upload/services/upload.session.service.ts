import { randomUUID } from 'node:crypto';
import type {
  IInitiateMultipartUploadResult,
  IResumeMultipartUploadResult,
  IPresignPartResult,
  ICompleteMultipartUploadResult,
  IMultipartUploadSession,
  InitiateMultipartUploadInput,
} from '@network/shared';
import { MULTIPART_PART_SIZE_BYTES } from '@network/shared';
import { storageProvider } from '../../../providers/provider.js';
import { ApiError } from '../../../utils/ApiError.js';
import * as uploadSessionRepository from '../upload.session.repository.js';
import { getMediaAdapter } from '../upload.media.registry.js';
import { ingestFromStorage } from './upload.ingest.service.js';

const requireOwnedActiveSession = async (
  userId: string,
  sessionId: string
): Promise<IMultipartUploadSession> => {
  const session = await uploadSessionRepository.getSession(sessionId);

  if (!session || session.userId !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This upload session does not belong to you or has expired.'
    );
  }

  if (session.status !== 'active') {
    throw new ApiError(
      409,
      'CONFLICT',
      `This upload session is already ${session.status}.`
    );
  }

  return session;
};

export const initiateMultipartUpload = async (
  userId: string,
  data: InitiateMultipartUploadInput
): Promise<IInitiateMultipartUploadResult> => {
  const adapter = getMediaAdapter(data.mediaType);

  if (!adapter.allowedMimeTypes.includes(data.mimeType)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `Unsupported file type for ${data.mediaType} uploads.`
    );
  }

  if (data.fileSizeBytes > adapter.maxSizeBytes) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `File exceeds the maximum size for ${data.mediaType} uploads.`
    );
  }

  const placeholder = await adapter.createPlaceholder(userId, data.fileName);

  const { storageKey, providerUploadId } =
    await storageProvider.createMultipartUpload(
      data.mediaType,
      userId,
      placeholder.id,
      data.mimeType
    );

  const partSize = MULTIPART_PART_SIZE_BYTES;
  const totalParts = Math.max(1, Math.ceil(data.fileSizeBytes / partSize));

  const session: IMultipartUploadSession = {
    sessionId: randomUUID(),
    userId,
    mediaType: data.mediaType,
    mediaId: placeholder.id,
    storageKey,
    providerUploadId,
    partSize,
    totalParts,
    fileSizeBytes: data.fileSizeBytes,
    fingerprint: data.fingerprint,
    parts: [],
    status: 'active',
  };

  await uploadSessionRepository.createSession(session);

  return {
    sessionId: session.sessionId,
    mediaId: session.mediaId,
    storageKey: session.storageKey,
    partSize: session.partSize,
    totalParts: session.totalParts,
  };
};

export const resumeMultipartUpload = async (
  userId: string,
  fingerprint: string
): Promise<IResumeMultipartUploadResult | null> => {
  const sessionId = await uploadSessionRepository.findSessionByFingerprint(
    userId,
    fingerprint
  );

  if (!sessionId) return null;

  const session = await uploadSessionRepository.getSession(sessionId);
  if (!session || session.userId !== userId || session.status !== 'active') {
    return null;
  }

  const uploadedParts = session.parts
    .filter(
      (part): part is { partNumber: number; size: number; etag: string } =>
        !!part.etag
    )
    .map((part) => ({ partNumber: part.partNumber, etag: part.etag }))
    .sort((a, b) => a.partNumber - b.partNumber);

  return {
    sessionId: session.sessionId,
    mediaId: session.mediaId,
    storageKey: session.storageKey,
    partSize: session.partSize,
    totalParts: session.totalParts,
    fileSizeBytes: session.fileSizeBytes,
    uploadedParts,
  };
};

export const presignUploadPart = async (
  userId: string,
  sessionId: string,
  partNumber: number
): Promise<IPresignPartResult> => {
  const session = await requireOwnedActiveSession(userId, sessionId);

  if (partNumber < 1 || partNumber > session.totalParts) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Part number is out of range for this upload session.'
    );
  }

  const { uploadUrl, blockId } = await storageProvider.presignPart(
    session.storageKey,
    session.providerUploadId,
    partNumber
  );

  if (blockId !== undefined) {
    return { scheme: 'block-blob', partNumber, uploadUrl, blockId };
  }

  return { scheme: 'direct', partNumber, uploadUrl };
};

export const recordUploadedPart = async (
  userId: string,
  sessionId: string,
  partNumber: number,
  etag: string,
  size: number
): Promise<void> => {
  const session = await requireOwnedActiveSession(userId, sessionId);

  if (partNumber < 1 || partNumber > session.totalParts) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Part number is out of range for this upload session.'
    );
  }

  await uploadSessionRepository.addCompletedPart(sessionId, {
    partNumber,
    size,
    etag,
  });
};

export const completeMultipartUpload = async (
  userId: string,
  sessionId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<ICompleteMultipartUploadResult> => {
  const session = await requireOwnedActiveSession(userId, sessionId);

  if (parts.length !== session.totalParts) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'All parts must be uploaded before this upload can be completed.'
    );
  }

  const sortedParts = [...parts].sort((a, b) => a.partNumber - b.partNumber);

  await storageProvider.completeMultipartUpload(
    session.storageKey,
    session.providerUploadId,
    sortedParts
  );

  const adapter = getMediaAdapter(session.mediaType);
  const placeholder = await adapter.findPlaceholder(session.mediaId);
  if (!placeholder) {
    throw new ApiError(404, 'NOT_FOUND', 'Media record not found.');
  }

  const { providerVideoId } = await ingestFromStorage({
    storageKey: session.storageKey,
    fileName: placeholder.ingestFileName,
    fileSizeBytes: session.fileSizeBytes,
    userId,
  });

  const marked = await adapter.markProcessing(session.mediaId, {
    providerVideoId,
    storageKey: session.storageKey,
  });

  if (!marked) {
    throw new ApiError(404, 'NOT_FOUND', 'Media record not found.');
  }

  await uploadSessionRepository.deleteSession(
    session.sessionId,
    session.userId,
    session.fingerprint
  );

  return { mediaId: session.mediaId, storageKey: session.storageKey };
};

export const abortMultipartUpload = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  const session = await uploadSessionRepository.getSession(sessionId);

  if (!session || session.userId !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This upload session does not belong to you or has expired.'
    );
  }

  if (session.status === 'active') {
    await storageProvider.abortMultipartUpload(
      session.storageKey,
      session.providerUploadId
    );

    const adapter = getMediaAdapter(session.mediaType);
    await adapter.deletePlaceholder(session.mediaId);
  }

  await uploadSessionRepository.deleteSession(
    session.sessionId,
    session.userId,
    session.fingerprint
  );
};
