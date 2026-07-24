import { useEffect, useRef } from 'react';
import type { WheelEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  PLAYER_WHEEL_NAVIGATION_COOLDOWN_MS,
  PLAYER_WHEEL_NAVIGATION_THRESHOLD,
  SHORT_THEATER_WIDTH_PX,
  type IShortResponse,
} from '@network/shared';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { SPRINGS } from '../../../shared/motion/springs';
import { usePreference } from '../../settings/hooks/usePreference';
import { cn } from '../../../shared/utils/cn';
import ShortPlayerStage from './ShortPlayerStage';
import ShortMetaRail from '../components/ShortMetaRail';
import ShortEngagementPanel from '../components/ShortEngagementPanel';

const ENGAGEMENT_RAIL_COLLAPSED_WIDTH_PX = 64;
const ENGAGEMENT_RAIL_EXPANDED_COMPACT_WIDTH_PX = 320;

interface ShortWatchDesktopProps {
  shorts: IShortResponse[];
  index: number;
  onIndexChange: (index: number) => void;
  compact?: boolean;
  highlightCommentId?: string;
  threadRootId?: string;
}

const ShortWatchDesktop = ({
  shorts,
  index,
  onIndexChange,
  compact = false,
  highlightCommentId,
  threadRootId,
}: ShortWatchDesktopProps) => {
  const short = shorts[index] ?? null;
  const rootRef = useRef<HTMLDivElement>(null);
  const wheelCooldownRef = useRef(false);
  const [layout, setLayout] = usePreference('layout');
  const commentsOpen = layout.shortsCommentsOpen ?? false;
  const { reduce } = useMotionSafe();

  useEffect(() => {
    if (highlightCommentId) setLayout({ shortsCommentsOpen: true });
  }, [highlightCommentId, setLayout]);

  const socket = useSocketContext();
  useContentRoom(socket, 'short', short?.id ?? '', rootRef);

  const handleNext = () => onIndexChange(Math.min(index + 1, shorts.length - 1));
  const handlePrev = () => onIndexChange(Math.max(index - 1, 0));

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (commentsOpen || wheelCooldownRef.current) return;
    if (Math.abs(event.deltaY) < PLAYER_WHEEL_NAVIGATION_THRESHOLD) return;

    wheelCooldownRef.current = true;
    if (event.deltaY > 0) handleNext();
    else handlePrev();

    setTimeout(() => {
      wheelCooldownRef.current = false;
    }, PLAYER_WHEEL_NAVIGATION_COOLDOWN_MS);
  };

  if (!short) return null;

  const expandedEngagementWidth = compact
    ? ENGAGEMENT_RAIL_EXPANDED_COMPACT_WIDTH_PX
    : SHORT_THEATER_WIDTH_PX;

  return (
    <div
      ref={rootRef}
      onWheel={handleWheel}
      className={cn(
        'flex items-stretch py-2',
        compact
          ? 'justify-start gap-2 overflow-x-auto px-4'
          : 'justify-center gap-4'
      )}
      style={{ height: 'calc(100dvh - 8rem)', maxHeight: 900 }}
    >
      <div
        className={cn(
          'flex h-full shrink-0 flex-col justify-end',
          compact ? 'w-56' : 'w-72'
        )}
      >
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
            ? expandedEngagementWidth
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
          highlightCommentId={highlightCommentId}
          threadRootId={threadRootId}
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
