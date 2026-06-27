export type ColCount = 1 | 2 | 4;

export const chunkIntoRows = <T>(arr: T[], size: ColCount): T[][] => {
  const rows: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
};

export const estimateRowHeight = (
  containerWidth: number,
  cols: ColCount
): number => {
  const gapTotal = (cols - 1) * 16;
  const colWidth = (containerWidth - gapTotal) / cols;
  const thumbHeight = colWidth * (9 / 16);
  return thumbHeight + 56 + 28;
};

export const COL_CLASS: Record<ColCount, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  4: 'grid-cols-4',
};
