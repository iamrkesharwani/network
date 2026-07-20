import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { CLIENT_ROUTES, type IVideoResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import Avatar from '../../../shared/ui/primitives/Avatar';

interface VideoMetaRailProps {
  video: IVideoResponse;
  descriptionOpen: boolean;
  onToggleDescription: () => void;
}

const VideoMetaRail = ({
  video,
  descriptionOpen,
  onToggleDescription,
}: VideoMetaRailProps) => {
  const profileHref = CLIENT_ROUTES.PROFILE.replace(
    ':username',
    video.author.username
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:rounded-lg lg:border lg:border-border lg:p-3">
      <button
        type="button"
        onClick={onToggleDescription}
        aria-expanded={descriptionOpen}
        disabled={!video.description}
        className="flex items-start gap-1.5 text-left focus:outline-none disabled:cursor-default lg:order-2 lg:min-w-0"
      >
        <h1 className="text-lg font-semibold text-text-primary lg:truncate">
          {video.title}
        </h1>
        {video.description && (
          <ChevronDown
            className={cn(
              'mt-1.5 h-4 w-4 shrink-0 text-text-muted transition-transform',
              descriptionOpen && 'rotate-180'
            )}
            strokeWidth={2.5}
          />
        )}
      </button>

      <div className="flex items-center gap-3 lg:order-1 lg:shrink-0">
        <Link to={profileHref}>
          <Avatar
            src={video.author.avatarUrl}
            alt={video.author.username}
            size="md"
            fallback={video.author.username}
          />
        </Link>
        <Link
          to={profileHref}
          className="text-sm font-medium text-text-primary hover:underline"
        >
          @{video.author.username}
        </Link>
      </div>
    </div>
  );
};

export default VideoMetaRail;
