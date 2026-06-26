import type { ReactNode } from 'react';
import Skeleton from './Skeleton';

interface AppShellSkeletonProps {
  children?: ReactNode;
}

const AppShellSkeleton = ({ children }: AppShellSkeletonProps) => {
  return (
    <div
      className="bg-surface-alt flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}
      aria-hidden="true"
    >
      <header className="sticky top-0 z-40 w-full h-14 bg-surface border-b border-border flex items-center px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-20 hidden sm:block" />
        </div>

        <div className="hidden md:flex flex-1 justify-center px-10">
          <Skeleton className="h-9 w-full max-w-md rounded-lg" />
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1 w-full min-h-0">
        <aside className="hidden md:flex md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] w-56 flex-col bg-surface border-r border-border shrink-0">
          <nav className="flex-1 px-3 py-4 space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="w-4.5 h-4.5 rounded shrink-0" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="w-4.5 h-4.5 rounded shrink-0" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppShellSkeleton;
