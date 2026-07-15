import type { Document, Model } from 'mongoose';
import {
  PREFIX_ENGINE_TAG,
  TEXT_ENGINE_TAG,
  type PaginatedResponse,
} from '@network/shared';
import { textSearchPaginate } from './textSearchPaginate.js';
import { prefixSearchPaginate } from './prefixSearchPaginate.js';

type PaginatedResult<T> = Omit<PaginatedResponse<T>, 'success' | 'message'>;

const tagCursor = <T>(
  result: PaginatedResult<T>,
  tag: string
): PaginatedResult<T> => ({
  ...result,
  meta: {
    ...result.meta,
    nextCursor: result.meta.nextCursor
      ? `${tag}${result.meta.nextCursor}`
      : null,
  },
});

export const hybridSearchPaginate = async <T extends Document>(
  model: Model<T>,
  q: string,
  filter: Record<string, unknown>,
  cursor: string | null | undefined,
  limit: number
): Promise<PaginatedResult<T>> => {
  if (cursor?.startsWith(PREFIX_ENGINE_TAG)) {
    const result = await prefixSearchPaginate<T>(
      model,
      q,
      filter,
      cursor.slice(PREFIX_ENGINE_TAG.length),
      limit
    );
    return tagCursor(result, PREFIX_ENGINE_TAG);
  }

  if (cursor?.startsWith(TEXT_ENGINE_TAG)) {
    const result = await textSearchPaginate<T>(
      model,
      q,
      filter,
      cursor.slice(TEXT_ENGINE_TAG.length),
      limit
    );
    return tagCursor(result, TEXT_ENGINE_TAG);
  }

  const textResult = await textSearchPaginate<T>(model, q, filter, null, limit);
  if (textResult.data.length > 0) return tagCursor(textResult, TEXT_ENGINE_TAG);

  const prefixResult = await prefixSearchPaginate<T>(
    model,
    q,
    filter,
    null,
    limit
  );
  return tagCursor(prefixResult, PREFIX_ENGINE_TAG);
};
