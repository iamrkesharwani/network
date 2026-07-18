import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SpinnerSize } from '@network/shared';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  messages?: string[];
  intervalMs?: number;
}

const Spinner = ({
  size = 'md',
  className = '',
  messages = [],
  intervalMs = 1500,
}: SpinnerProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= messages.length - 1) {
          clearInterval(timer);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [messages, intervalMs]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const combinedClasses =
    `animate-spin text-current ${sizeClasses[size]} ${className}`.trim();

  return (
    <div
      role="status"
      className="inline-flex flex-col items-center justify-center gap-3"
    >
      <Loader2 className={combinedClasses} />

      {messages.length > 0 ? (
        <span
          key={currentIndex}
          className="text-sm font-medium text-gray-500 animate-pulse"
        >
          {messages[currentIndex]}
        </span>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
};

export default Spinner;
