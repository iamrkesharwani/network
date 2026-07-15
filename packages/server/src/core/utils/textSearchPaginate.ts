import mongoose from 'mongoose';
import type { Document, Model, PipelineStage } from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '@network/shared';

interface TextSearchCursor {
  score: number;
  id: string;
}

const encodeTextSearchCursor = (cursor: TextSearchCursor): string =>
  Buffer.from(JSON.stringify(cursor), 'utf-8').toString('base64url');

const decodeTextSearchCursor = (raw: string): TextSearchCursor | null => {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf-8')
    ) as Partial<TextSearchCursor>;

    if (typeof parsed.score !== 'number' || typeof parsed.id !== 'string') {
      return null;
    }

    return { score: parsed.score, id: parsed.id };
  } catch {
    return null;
  }
};

export const textSearchPaginate = async <T extends Document>(
  model: Model<T>,
  q: string,
  filter: Record<string, unknown>,
  cursor: string | null | undefined,
  limit: number = DEFAULT_PAGE_LIMIT
): Promise<Omit<PaginatedResponse<T>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodeTextSearchCursor(cursor) : null;

  const pipeline: PipelineStage[] = [
    { $match: { ...filter, $text: { $search: q } } },
    { $addFields: { score: { $meta: 'textScore' } } },
    ...(decoded
      ? [
          {
            $match: {
              $or: [
                { score: { $lt: decoded.score } },
                {
                  score: decoded.score,
                  _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
                },
              ],
            },
          } as PipelineStage,
        ]
      : []),
    { $sort: { score: -1, _id: -1 } },
    { $limit: safeLimit + 1 },
  ];

  const data = (await model.aggregate(pipeline).exec()) as unknown as T[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1] as unknown as
    | { _id: mongoose.Types.ObjectId; score: number }
    | undefined;

  const nextCursor =
    hasNextPage && lastItem
      ? encodeTextSearchCursor({
          score: lastItem.score,
          id: String(lastItem._id),
        })
      : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};
