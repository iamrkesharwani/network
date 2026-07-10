import { User, type IUserDocument } from './user.model.js';

export const findByUsername = (
  username: string
): Promise<IUserDocument | null> =>
  User.findOne({ username: username.toLowerCase() }).exec();
