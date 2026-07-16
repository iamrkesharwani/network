import type { Request, Response } from 'express';
import type { DeactivateAccountInput, DeleteAccountInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as accountService from '../account.service.js';

export const deactivate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

  const user = await accountService.deactivateAccount(
    req.user.id,
    req.body as DeactivateAccountInput
  );

  res.status(200).json(new ApiResponse(user, 'Account deactivated'));
});

export const reactivate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

  const user = await accountService.reactivateAccount(req.user.id);

  res.status(200).json(new ApiResponse(user, 'Account reactivated'));
});

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const user = await accountService.requestAccountDeletion(
      req.user.id,
      req.body as DeleteAccountInput
    );

    res
      .status(200)
      .json(new ApiResponse(user, 'Account scheduled for deletion'));
  }
);
