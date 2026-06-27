import { useGridCols } from '../../../features/video/hooks/useGridCols';
import { VideoGridSkeleton } from './VideoGridSkeleton';

const VideoFeedSkeleton = () => {
  const cols = useGridCols();
  return <VideoGridSkeleton count={8} cols={cols} />;
};

export default VideoFeedSkeleton;
