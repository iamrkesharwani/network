import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const VideoGrid = () => {
  return (
    <div
      className="fixed inset-0 z-0 grid grid-cols-4 grid-rows-3 gap-0.5"
      aria-hidden="true"
    ></div>
  );
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div
      className="relative bg-[--color-surface] text-[--color-text-primary] font-sans antialiased"
      style={{ minHeight: '100dvh' }}
    >
      <VideoGrid />

      <div className="bg-veil fixed inset-0 z-1" aria-hidden="true" />

      <div
        className="spotlight fixed z-1 w-176 h-176 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />

      <div
        className="relative z-2 flex items-center justify-center px-6 py-8"
        style={{ minHeight: '100dvh' }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
