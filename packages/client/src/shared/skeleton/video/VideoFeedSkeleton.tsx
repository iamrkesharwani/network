import { useGridCols } from '../../../features/video/hooks/useGridCols';
import { VideoGridSkeleton } from './VideoGridSkeleton';

const VideoFeedSkeleton = () => {
  const cols = useGridCols();
  return <VideoGridSkeleton count={12} cols={cols} />;
};

export default VideoFeedSkeleton;
