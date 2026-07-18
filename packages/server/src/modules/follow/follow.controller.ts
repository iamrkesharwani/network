import type { Request, Response } from 'express';
import type { FollowListQuery } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import {
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  removeFollower as removeFollowerService,
} from './services/follow.crud.service.js';

const getListQuery = (req: Request): FollowListQuery =>
  req.query as unknown as FollowListQuery;

export const followUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await follow(req.user.id, req.params['username'] as string);

    res.status(200).json(new ApiResponse(null, 'Followed successfully'));
  }
);

export const unfollowUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await unfollow(req.user.id, req.params['username'] as string);

    res.status(200).json(new ApiResponse(null, 'Unfollowed successfully'));
  }
);

export const listFollowers = asyncHandler(
  async (req: Request, res: Response) => {
    const { cursor, limit } = getListQuery(req);
    const result = await getFollowers(
      req.params['username'] as string,
      cursor ?? null,
      limit,
      req.user?.id
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          'Followers fetched successfully'
        )
      );
  }
);

export const listFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const { cursor, limit } = getListQuery(req);
    const result = await getFollowing(
      req.params['username'] as string,
      cursor ?? null,
      limit,
      req.user?.id
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          'Following fetched successfully'
        )
      );
  }
);

export const removeFollower = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await removeFollowerService(req.user.id, req.params['username'] as string);

    res.status(200).json(new ApiResponse(null, 'Follower removed successfully'));
  }
);
