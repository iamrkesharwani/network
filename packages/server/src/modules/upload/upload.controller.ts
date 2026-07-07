import type { Request, Response } from 'express';
import type {
  InitiateMultipartUploadInput,
  ResumeMultipartUploadInput,
  MultipartSessionIdParam,
  PresignPartParam,
  CompleteMultipartUploadInput,
  CompletePartInput,
} from '@network/shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as uploadSessionService from './services/upload.session.service.js';

const requireUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId)
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  return userId;
};

export const initiate = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);

  const result = await uploadSessionService.initiateMultipartUpload(
    userId,
    req.body as InitiateMultipartUploadInput
  );

  res
    .status(201)
    .json(new ApiResponse(result, 'Upload session created successfully'));
});

export const resume = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { fingerprint } = req.body as ResumeMultipartUploadInput;

  const result = await uploadSessionService.resumeMultipartUpload(
    userId,
    fingerprint
  );

  if (!result) {
    throw new ApiError(
      404,
      'NOT_FOUND',
      'No resumable upload session found for this file.'
    );
  }

  res.status(200).json(new ApiResponse(result, 'Upload session found'));
});

export const presignPart = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { sessionId, partNumber } = req.params as unknown as PresignPartParam;

  const result = await uploadSessionService.presignUploadPart(
    userId,
    sessionId,
    partNumber
  );

  res.status(200).json(new ApiResponse(result, 'Part presigned'));
});

export const completePart = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { sessionId, partNumber } = req.params as unknown as PresignPartParam;
    const { etag, size } = req.body as CompletePartInput;

    await uploadSessionService.recordUploadedPart(
      userId,
      sessionId,
      partNumber,
      etag,
      size
    );

    res.status(200).json(new ApiResponse(null, 'Part recorded'));
  }
);

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { sessionId } = req.params as unknown as MultipartSessionIdParam;
  const { parts } = req.body as CompleteMultipartUploadInput;

  const result = await uploadSessionService.completeMultipartUpload(
    userId,
    sessionId,
    parts
  );

  res
    .status(200)
    .json(new ApiResponse(result, 'Upload confirmed. Processing started.'));
});

export const abort = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { sessionId } = req.params as unknown as MultipartSessionIdParam;

  await uploadSessionService.abortMultipartUpload(userId, sessionId);

  res.status(200).json(new ApiResponse(null, 'Upload session aborted'));
});
