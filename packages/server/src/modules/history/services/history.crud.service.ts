import type {
  HistoryContentType,
  IHistoryResumeResponse,
} from '@network/shared';
import { HISTORY_COMPLETED_THRESHOLD } from '@network/shared';
import * as historyRepository from '../history.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import type { Requester } from '../history.types.js';
import { toResponse } from './history.mappers.js';

export const getHistory = async (
  userId: string,
  cursor: string | null,
  limit: number
) => {
  const result = await historyRepository.findByUserPaginated(
    userId,
    cursor,
    limit
  );

  const data = result.data
    .map(toResponse)
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return { ...result, data };
};

export const getResumePoint = async (
  userId: string,
  contentType: HistoryContentType,
  contentId: string
): Promise<IHistoryResumeResponse | null> => {
  const entry = await historyRepository.findByUserAndContent(
    userId,
    contentType,
    contentId
  );
  if (!entry) return null;

  const progressPercent =
    entry.duration && entry.duration > 0
      ? Math.min(1, entry.currentTime / entry.duration)
      : 0;
  const completed = progressPercent >= HISTORY_COMPLETED_THRESHOLD;

  if (completed) return null;

  return {
    currentTime: entry.currentTime,
    ...(entry.duration !== undefined && { duration: entry.duration }),
    completed,
  };
};

export const removeEntry = async (
  id: string,
  requester: Requester
): Promise<void> => {
  const entry = await historyRepository.findById(id);
  if (!entry) throw new ApiError(404, 'NOT_FOUND', 'History entry not found.');

  if (getOwnerId(entry.userId) !== requester.id) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You cannot delete this history entry.'
    );
  }

  await historyRepository.deleteById(id);
};

export const clearHistory = async (userId: string): Promise<void> => {
  await historyRepository.deleteAllByUserId(userId);
};
