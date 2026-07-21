import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const PlaylistPageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="relative -mx-4 -mt-0 w-[calc(100%+2rem)] overflow-hidden rounded-b-2xl bg-surface-raised md:-mx-5 md:-mt-5 md:w-[calc(100%+2.5rem)]">
      <div className="relative z-10 mx-auto my-5 flex w-[calc(100%-2rem)] max-w-4xl flex-col items-center gap-4 rounded-2xl border border-border bg-surface-overlay/80 p-4 md:my-8 md:flex-row md:items-center md:gap-6 md:p-6">
        <Skeleton className="h-40 w-40 shrink-0 rounded-xl" />

        <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-2.5 md:items-start">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-7 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="mt-1 h-9 w-32 rounded-full" />
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-16 w-28 shrink-0 rounded-lg" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-3.5 w-[70%] rounded" />
            <Skeleton className="h-3 w-[40%] rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PlaylistPageSkeleton;
