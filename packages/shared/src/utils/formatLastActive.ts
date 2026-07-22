export const formatLastActive = (lastActiveAt: string | Date): string => {
  const date = new Date(lastActiveAt);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Active just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Active ${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Active ${diffInDays}d ago`;
};
