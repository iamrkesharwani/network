import type { Request, Response } from 'express';
import type { DeactivateAccountInput } from '@network/shared';
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
