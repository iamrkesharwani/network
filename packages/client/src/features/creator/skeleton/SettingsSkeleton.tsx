import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const SettingsRowSkeleton = () => (
  <div className="flex flex-col gap-2 py-4 border-b border-border last:border-0">
    <Skeleton className="h-3.5 w-28" />
    <Skeleton className="h-10 w-full max-w-md rounded-lg" />
  </div>
);

const SettingsSkeleton = () => (
  <div className="flex flex-col max-w-2xl">
    <Skeleton className="h-5 w-40 mb-6" />
    {Array.from({ length: 4 }).map((_, i) => (
      <SettingsRowSkeleton key={i} />
    ))}
    <Skeleton className="h-10 w-28 rounded-lg mt-6" />
  </div>
);

export default SettingsSkeleton;
