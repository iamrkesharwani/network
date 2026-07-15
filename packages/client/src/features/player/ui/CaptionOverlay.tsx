import { cn } from '../../../shared/utils/cn';

interface CaptionOverlayProps {
  activeCueText: string;
  className?: string;
}

const CaptionOverlay = ({ activeCueText, className }: CaptionOverlayProps) => {
  if (!activeCueText) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-20 flex justify-center px-4',
        className
      )}
    >
      <p className="max-w-[90%] rounded bg-surface/70 px-3 py-1.5 text-center text-sm whitespace-pre-line text-text-primary sm:text-base">
        {activeCueText}
      </p>
    </div>
  );
};

export default CaptionOverlay;
