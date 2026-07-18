import mongoose from 'mongoose';
import type { IFollowListItem } from '@network/shared';
import type { IFollowDocument } from '../follow.model.js';

interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  name: string;
  avatarUrl?: string;
}

export const toFollowListItem = (
  doc: IFollowDocument,
  populatedField: 'followerId' | 'followeeId'
): IFollowListItem | null => {
  const user = doc[populatedField] as unknown as PopulatedUser | null;
  if (!user || !user.username) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
  };
};
