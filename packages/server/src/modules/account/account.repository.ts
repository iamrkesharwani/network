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

export const restoreActiveStatus = (
  userId: string
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    {
      $set: {
        status: 'active',
        deactivatedAt: null,
        reactivateAt: null,
        deletionRequestedAt: null,
        deletionScheduledAt: null,
      },
    },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();

export const scheduleUserDeletion = (
  userId: string,
  deletionRequestedAt: Date,
  deletionScheduledAt: Date
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    {
      $set: {
        status: 'pending_deletion',
        deletionRequestedAt,
        deletionScheduledAt,
      },
    },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();
