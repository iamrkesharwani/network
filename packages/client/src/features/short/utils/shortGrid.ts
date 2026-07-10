export type ShortColCount = 2 | 3 | 4 | 5 | 6;

export const chunkIntoRows = <T>(arr: T[], size: ShortColCount): T[][] => {
  const rows: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
};

export const estimateShortRowHeight = (
  containerWidth: number,
  cols: ShortColCount
): number => {
  const gapTotal = (cols - 1) * 12;
  const colWidth = (containerWidth - gapTotal) / cols;
  const thumbHeight = colWidth * (16 / 9);
  return thumbHeight + 56 + 28;
};

export const SHORT_COL_CLASS: Record<ShortColCount, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};
