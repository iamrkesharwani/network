import type { IShortResponse } from '../../../../../shared/src';
import { cn } from '../../../shared/utils/cn';

interface ShortThumbnailProps {
  short: IShortResponse;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  titleClassName?: string;
}

const ShortThumbnail = ({
  short,
  isActive,
  onClick,
  className,
  titleClassName,
}: ShortThumbnailProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full aspect-9/16 rounded-xl overflow-hidden bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
    >
      {short.thumbnailUrl && (
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          draggable={false}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

      <p
        className={cn(
          'absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white leading-tight line-clamp-2',
          titleClassName
        )}
      >
        {short.title}
      </p>

      {isActive && (
        <div className="absolute inset-0 ring-2 ring-primary rounded-xl pointer-events-none" />
      )}
    </button>
  );
};

export default ShortThumbnail;
