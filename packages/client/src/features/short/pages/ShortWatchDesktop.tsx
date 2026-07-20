import type { IShortResponse } from '@network/shared';
import ShortPlayer from './ShortPlayer';

interface ShortWatchDesktopProps {
  shorts: IShortResponse[];
  index: number;
  onIndexChange: (index: number) => void;
}

const ShortWatchDesktop = ({
  shorts,
  index,
  onIndexChange,
}: ShortWatchDesktopProps) => {
  const short = shorts[index] ?? null;

  const handleNext = () => onIndexChange(Math.min(index + 1, shorts.length - 1));
  const handlePrev = () => onIndexChange(Math.max(index - 1, 0));

  return (
    <div className="flex justify-center py-2">
      <div className="h-[calc(100dvh-8rem)] max-h-[900px]">
        <ShortPlayer
          short={short}
          activeIndex={index}
          total={shorts.length}
          onNext={handleNext}
          onPrev={handlePrev}
          variant="page"
          className="h-full"
        />
      </div>
    </div>
  );
};

export default ShortWatchDesktop;
