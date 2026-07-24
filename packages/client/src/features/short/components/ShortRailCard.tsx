import { useRef } from 'react';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import {
  SHORT_RAIL_ASPECT_CLASS,
  formatCount,
  getRelativeDate,
  type IShortResponse,
} from '@network/shared';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import ShortCardThumbnail from './ShortCardThumbnail';

interface ShortRailCardProps {
  short: IShortResponse;
  onClick?: (short: IShortResponse) => void;
}

const ShortRailCard = ({ short, onClick }: ShortRailCardProps) => {
  const isReady = short.status === 'READY';

  const cardRef = useRef<HTMLDivElement>(null);
  const socket = useSocketContext();
  useContentRoom(socket, 'short', short.id, cardRef);

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl max-md:portrait:rounded-none overflow-hidden"
    >
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
        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/80">
          <span className="inline-flex items-center gap-0.5">
            <Eye className="w-3 h-3" strokeWidth={2} />
            {formatCount(short.views)}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Heart className="w-3 h-3" strokeWidth={2} />
            {formatCount(short.likes)}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MessageCircle className="w-3 h-3" strokeWidth={2} />
            {formatCount(short.commentsCount)}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Share2 className="w-3 h-3" strokeWidth={2} />
            {formatCount(short.shares)}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-white/60">
          {getRelativeDate(short.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ShortRailCard;
