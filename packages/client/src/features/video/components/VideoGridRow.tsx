import type { IVideoResponse } from '@network/shared';
import { COL_CLASS, type ColCount } from '../../../shared/utils/videoGrid';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import VideoCard from '../pages/VideoCard';

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

interface VideoGridRowProps {
  videos: IVideoResponse[];
  rowIndex: number;
  cols: ColCount;
  isOwner: boolean;
  seenIds: React.RefObject<Set<string>>;
  onEdit?: (video: IVideoResponse) => void;
  onDelete?: (video: IVideoResponse) => void;
}

const VideoGridRow = ({
  videos,
  rowIndex,
  cols,
  isOwner,
  seenIds,
  onEdit,
  onDelete,
}: VideoGridRowProps) => {
  const getAnimIndex = useCallback(
    (id: string, posIdx: number) => {
      if (seenIds.current.has(id)) return -1;
      seenIds.current.add(id);
      return posIdx;
    },
    [seenIds]
  );

  return (
    <div className={`grid ${COL_CLASS[cols]} gap-x-4`}>
      {videos.map((video, colIdx) => {
        const globalIdx = rowIndex * cols + colIdx;
        const animIdx = getAnimIndex(video.id, globalIdx);
        return (
          <motion.div
            key={video.id}
            custom={animIdx >= 0 ? animIdx % cols : 0}
            variants={cardVariants}
            initial={animIdx >= 0 ? 'hidden' : false}
            animate="visible"
          >
            <VideoCard
              video={video}
              isOwner={isOwner}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default VideoGridRow;
