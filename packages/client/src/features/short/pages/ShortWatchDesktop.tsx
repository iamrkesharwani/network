import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SHORT_THEATER_WIDTH_PX, type IShortResponse } from '@network/shared';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { SPRINGS } from '../../../shared/motion/springs';
import { usePreference } from '../../settings/hooks/usePreference';
import ShortPlayerStage from './ShortPlayerStage';
import ShortMetaRail from '../components/ShortMetaRail';
import ShortEngagementPanel from '../components/ShortEngagementPanel';

const ENGAGEMENT_RAIL_COLLAPSED_WIDTH_PX = 64;

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = usePreference('layout');
  const commentsOpen = layout.shortsCommentsOpen ?? false;
  const { reduce } = useMotionSafe();

  const socketRef = useSocketContext();
  useContentRoom(socketRef, 'short', short?.id ?? '', rootRef);

  const handleNext = () => onIndexChange(Math.min(index + 1, shorts.length - 1));
  const handlePrev = () => onIndexChange(Math.max(index - 1, 0));

  if (!short) return null;

  return (
    <div
      ref={rootRef}
      className="flex items-stretch justify-center gap-4 py-2"
      style={{ height: 'calc(100dvh - 8rem)', maxHeight: 900 }}
    >
      <div className="flex h-full w-72 shrink-0 flex-col justify-end">
        <ShortMetaRail short={short} />
      </div>

      <div className="h-full shrink-0" style={{ width: SHORT_THEATER_WIDTH_PX }}>
        <ShortPlayerStage
          short={short}
          onNext={handleNext}
          onPrev={handlePrev}
          className="h-full"
        />
      </div>

      <motion.div
        className="h-full shrink-0"
        initial={false}
        animate={{
          width: commentsOpen
            ? SHORT_THEATER_WIDTH_PX
            : ENGAGEMENT_RAIL_COLLAPSED_WIDTH_PX,
        }}
        transition={reduce ? { duration: 0 } : SPRINGS.smooth}
      >
        <ShortEngagementPanel
          short={short}
          commentsOpen={commentsOpen}
          onToggleComments={() =>
            setLayout({ shortsCommentsOpen: !commentsOpen })
          }
        />
      </motion.div>

      <div className="flex h-full shrink-0 flex-col items-center justify-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Previous short"
          className="w-9 h-9 rounded-full bg-surface-overlay border border-border flex items-center justify-center text-text-primary hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none"
        >
          <ChevronUp className="w-4.5 h-4.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={index >= shorts.length - 1}
          aria-label="Next short"
          className="w-9 h-9 rounded-full bg-surface-overlay border border-border flex items-center justify-center text-text-primary hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none"
        >
          <ChevronDown className="w-4.5 h-4.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ShortWatchDesktop;
