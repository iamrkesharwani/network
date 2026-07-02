export const formatEta = (seconds: number | null): string => {
  if (seconds === null || !Number.isFinite(seconds)) return 'calculating…';
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s left`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m left`;
};
