import mongoose from 'mongoose';

export const getOwnerId = (
  userId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId } | string
): string => {
  if (userId && typeof userId === 'object' && '_id' in userId && userId._id) {
    return userId._id.toString();
  }
  return String(userId);
};
