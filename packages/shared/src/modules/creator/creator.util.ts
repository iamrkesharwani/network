export const getCatalogIds = <T extends Record<string, unknown>>(
  catalog: T
): (keyof T)[] => Object.keys(catalog) as (keyof T)[];

export const toSortedMilestoneList = <
  T extends Record<string, { threshold: number | null }>,
>(
  catalog: T
) =>
  getCatalogIds(catalog)
    .map((id) => ({ id, ...catalog[id] }))
    .filter(
      (entry): entry is typeof entry & { threshold: number } =>
        entry.threshold !== null
    )
    .sort((a, b) => a.threshold - b.threshold);
