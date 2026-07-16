import { User, type IUserDocument } from '../user/user.model.js';

export const deactivateUser = (
  userId: string,
  deactivatedAt: Date,
  reactivateAt: Date
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    { $set: { status: 'deactivated', deactivatedAt, reactivateAt } },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();

export const reactivateUser = (
  userId: string
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    {
      $set: { status: 'active', deactivatedAt: null, reactivateAt: null },
    },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();
