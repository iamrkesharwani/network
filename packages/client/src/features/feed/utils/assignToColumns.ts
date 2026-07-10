export const assignToColumns = <T,>(
  items: T[],
  estimateHeight: (item: T) => number,
  columnCount: number
): T[][] => {
  if (columnCount <= 1) return [items];

  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  const columnHeights = new Array(columnCount).fill(0);

  for (const item of items) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columnHeights[i] < columnHeights[shortest]) shortest = i;
    }
    columns[shortest].push(item);
    columnHeights[shortest] += estimateHeight(item);
  }

  return columns;
};
