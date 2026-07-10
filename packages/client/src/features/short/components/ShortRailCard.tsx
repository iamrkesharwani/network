import type { IShortResponse } from '@network/shared';
import ShortCardThumbnail from './ShortCardThumbnail';

const SHORT_RAIL_ASPECT_CLASS = 'aspect-3/4';

interface ShortRailCardProps {
  short: IShortResponse;
  onClick?: (short: IShortResponse) => void;
}

const ShortRailCard = ({ short, onClick }: ShortRailCardProps) => {
  const isReady = short.status === 'READY';

  return (
    <div className="relative rounded-2xl max-md:portrait:rounded-none overflow-hidden">
      <ShortCardThumbnail
        short={short}
        isReady={isReady}
        onClick={onClick ? () => onClick(short) : undefined}
        aspectClassName={SHORT_RAIL_ASPECT_CLASS}
      />
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-6 bg-linear-to-t from-black/80 to-transparent pointer-events-none">
        <p className="text-xs font-medium text-white line-clamp-1">
          {short.title}
        </p>
      </div>
    </div>
  );
};

export default ShortRailCard;
