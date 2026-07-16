import type { IUser } from '@network/shared';
import type { IUserDocument } from '../../modules/user/user.model.js';

export const toUserResponse = (user: IUserDocument): IUser => {
  const hasPassword = Boolean(user.password);
  const json = user.toJSON() as unknown as IUser;
  return { ...json, hasPassword };
};
