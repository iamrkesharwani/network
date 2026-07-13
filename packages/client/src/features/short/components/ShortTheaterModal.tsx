import { useEffect } from 'react';
import { X } from 'lucide-react';
import { SHORT_THEATER_WIDTH_PX, type IShortResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import ShortPlayer from '../pages/ShortPlayer';

interface ShortTheaterModalProps {
  short: IShortResponse | null;
  activeIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onLike?: () => void;
  className?: string;
}

const ShortTheaterModal = ({
  short,
  activeIndex,
  total,
  onNext,
  onPrev,
  onClose,
  onLike,
  className,
}: ShortTheaterModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-h-[90vh]"
        style={{ maxWidth: SHORT_THEATER_WIDTH_PX }}
        onClick={(e) => e.stopPropagation()}
      >
        <ShortPlayer
          short={short}
          activeIndex={activeIndex}
          total={total}
          onNext={onNext}
          onPrev={onPrev}
          onLike={onLike}
          className={cn('h-full', className)}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>
    </div>
  );
};

export default ShortTheaterModal;
