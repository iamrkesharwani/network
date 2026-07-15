import type { IShortResponse, IVideoResponse } from '@network/shared';
import { chunkIntoRows, type ColCount } from './videoGrid';

export type SuggestionRow =
  | { type: 'video'; items: IVideoResponse[] }
  | { type: 'short'; items: IShortResponse[] };

export const buildSuggestionRows = (
  videos: IVideoResponse[],
  shorts: IShortResponse[],
  cols: ColCount,
  videoRowsPerShortRow: number
): SuggestionRow[] => {
  const videoRows = chunkIntoRows(videos, cols);
  const shortRows = chunkIntoRows(shorts, cols);

  const rows: SuggestionRow[] = [];
  let shortRowIndex = 0;

  videoRows.forEach((row, index) => {
    rows.push({ type: 'video', items: row });

    const isIntervalReached = (index + 1) % videoRowsPerShortRow === 0;
    if (isIntervalReached && shortRowIndex < shortRows.length) {
      rows.push({ type: 'short', items: shortRows[shortRowIndex] });
      shortRowIndex += 1;
    }
  });

  while (shortRowIndex < shortRows.length) {
    rows.push({ type: 'short', items: shortRows[shortRowIndex] });
    shortRowIndex += 1;
  }

  return rows;
};
