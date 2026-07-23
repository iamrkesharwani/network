import type { Request, Response } from 'express';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  ALLOWED_BANNER_MIME_TYPES,
  type BasicProfileInput,
  type PersonalDetailsInput,
  type ContactLinksInput,
  type BannerPresetSelectInput,
  type AccountPrivacyInput,
} from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../core/middleware/upload.middleware.js';
import * as userProfileService from '../services/user.profile.service.js';

export const patchBasicProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const user = await userProfileService.updateBasicProfile(
      req.user.id,
      req.body as BasicProfileInput
    );

    res.status(200).json(new ApiResponse(user, 'Profile updated successfully'));
  }
);

export const patchPersonalDetails = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const user = await userProfileService.updatePersonalDetails(
      req.user.id,
      req.body as PersonalDetailsInput
    );

    res.status(200).json(new ApiResponse(user, 'Profile updated successfully'));
  }
);

export const patchContactLinks = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const user = await userProfileService.updateContactLinks(
      req.user.id,
      req.body as ContactLinksInput
    );

    res.status(200).json(new ApiResponse(user, 'Profile updated successfully'));
  }
);

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const file = req.file;
    if (!file) throw new ApiError(400, 'VALIDATION_ERROR', 'No file uploaded.');

    await verifyFileMagicBytes(file, ALLOWED_AVATAR_MIME_TYPES);

    const user = await userProfileService.uploadAvatar(
      req.user.id,
      file.buffer,
      file.mimetype
    );

    res.status(200).json(new ApiResponse(user, 'Avatar updated successfully'));
  }
);

export const uploadBanner = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const file = req.file;
    if (!file) throw new ApiError(400, 'VALIDATION_ERROR', 'No file uploaded.');

    await verifyFileMagicBytes(file, ALLOWED_BANNER_MIME_TYPES);

    const user = await userProfileService.uploadBanner(
      req.user.id,
      file.buffer,
      file.mimetype
    );

    res.status(200).json(new ApiResponse(user, 'Banner updated successfully'));
  }
);

export const patchAccountPrivacy = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const user = await userProfileService.updateAccountPrivacy(
      req.user.id,
      req.body as AccountPrivacyInput
    );

    res.status(200).json(new ApiResponse(user, 'Privacy setting updated successfully'));
  }
);

export const selectBannerPreset = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { presetId } = req.body as BannerPresetSelectInput;
    const user = await userProfileService.selectBannerPreset(
      req.user.id,
      presetId
    );

    res.status(200).json(new ApiResponse(user, 'Banner updated successfully'));
  }
);
