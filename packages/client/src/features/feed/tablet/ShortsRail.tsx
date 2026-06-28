import { useRef } from 'react';
import { useShort } from '../../short/useShort';
import { cn } from '../../../shared/utils/cn';
import { ALL_SHORTS } from '../__dev__/feedMockData';
import ShortThumbnail from '../mobile/ShortThumbnail';

interface ShortsRailProps {
  className?: string;
}

const ShortsRail = ({ className }: ShortsRailProps) => {
  const { activeIndex, goToIndex } = useShort();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex flex-col gap-3 overflow-y-auto scrollbar-hide pr-1',
        className
      )}
    >
      {ALL_SHORTS.map((short, i) => (
        <ShortThumbnail
          key={short.id}
          short={short}
          isActive={activeIndex === i}
          onClick={() => goToIndex(i)}
        />
      ))}
    </div>
  );
};

export default ShortsRail;
