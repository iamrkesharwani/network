import type { Request, Response } from 'express';
import type { PostFeedQuery, PostUpdateInput, PostUserFeedQuery } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiPaginatedResponse } from '../../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import {
  deletePost,
  getMyPosts,
  getPublicFeed,
  getPostById,
  getUserPosts,
  updatePost,
} from '../services/post.crud.service.js';

const getFeedQuery = (req: Request): PostFeedQuery =>
  req.query as unknown as PostFeedQuery;

const getUserFeedQuery = (req: Request): PostUserFeedQuery =>
  req.query as unknown as PostUserFeedQuery;

const getPostIdParam = (req: Request): string => req.params['postId'] as string;

const getUsernameParam = (req: Request): string =>
  req.params['username'] as string;

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit } = getFeedQuery(req);
  const result = await getPublicFeed(cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Feed fetched successfully'
      )
    );
});

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = getFeedQuery(req);
  const result = await getMyPosts(req.user.id, cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Your posts fetched successfully'
      )
    );
});

export const getByUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const { cursor, limit, visibility } = getUserFeedQuery(req);
    const result = await getUserPosts(
      getUsernameParam(req),
      req.user?.id,
      cursor ?? null,
      limit,
      visibility
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          "User's posts fetched successfully"
        )
      );
  }
);

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const post = await getPostById(getPostIdParam(req), req.user);

  res.status(200).json(new ApiResponse(post, 'Post fetched successfully'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const post = await updatePost(
    getPostIdParam(req),
    req.user,
    req.body as PostUpdateInput
  );

  res.status(200).json(new ApiResponse(post, 'Post updated successfully'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await deletePost(getPostIdParam(req), req.user);

  res.status(200).json(new ApiResponse(null, 'Post deleted successfully'));
});
