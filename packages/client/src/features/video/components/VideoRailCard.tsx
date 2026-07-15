import type { IVideoResponse } from '@network/shared';
import VideoCardThumbnail from './VideoCardThumbnail';

interface VideoRailCardProps {
  video: IVideoResponse;
}

const VideoRailCard = ({ video }: VideoRailCardProps) => {
  const isReady = video.status === 'READY';

  return (
    <div className="relative w-56 shrink-0 overflow-hidden rounded-lg">
      <VideoCardThumbnail video={video} isReady={isReady} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-2.5 pt-6 pb-2">
        <p className="line-clamp-1 text-xs font-medium text-white">
          {video.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">
          @{video.author.username}
        </p>
      </div>
    </div>
  );
};

export default VideoRailCard;
