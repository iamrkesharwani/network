import type { IShortResponse } from '@network/shared';
import { SHORT_COL_CLASS, type ShortColCount } from '../utils/shortGrid';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import ShortCard from '../pages/ShortCard';

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.26,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

interface ShortGridRowProps {
  shorts: IShortResponse[];
  rowIndex: number;
  cols: ShortColCount;
  isOwner: boolean;
  seenIds: React.RefObject<Set<string>>;
  onDelete?: (short: IShortResponse) => Promise<void> | void;
  onToggleVisibility?: (short: IShortResponse) => Promise<void> | void;
  onThumbnailClick?: (short: IShortResponse) => void;
}

const ShortGridRow = ({
  shorts,
  rowIndex,
  cols,
  isOwner,
  seenIds,
  onDelete,
  onToggleVisibility,
  onThumbnailClick,
}: ShortGridRowProps) => {
  const getAnimIndex = useCallback(
    (id: string, posIdx: number) => {
      if (seenIds.current.has(id)) return -1;
      seenIds.current.add(id);
      return posIdx;
    },
    [seenIds]
  );

  return (
    <div className={`grid ${SHORT_COL_CLASS[cols]} gap-x-3`}>
      {shorts.map((short, colIdx) => {
        const globalIdx = rowIndex * cols + colIdx;
        const animIdx = getAnimIndex(short.id, globalIdx);
        return (
          <motion.div
            key={short.id}
            custom={animIdx >= 0 ? animIdx % cols : 0}
            variants={cardVariants}
            initial={animIdx >= 0 ? 'hidden' : false}
            animate="visible"
          >
            <ShortCard
              short={short}
              isOwner={isOwner}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              onThumbnailClick={onThumbnailClick}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShortGridRow;
