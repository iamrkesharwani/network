import type { PaginatedResponse } from '@network/shared';
import { User, type IUserDocument } from './user.model.js';
import { hybridSearchPaginate } from '../../core/utils/hybridSearchPaginate.js';

export const findByUsername = (
  username: string
): Promise<IUserDocument | null> =>
  User.findOne({ username: username.toLowerCase() }).exec();

export const searchUsers = (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IUserDocument>, 'success' | 'message'>> =>
  hybridSearchPaginate(User, q, {}, cursor, limit);
