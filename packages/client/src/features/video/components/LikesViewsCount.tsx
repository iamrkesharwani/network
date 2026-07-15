import { Heart, Eye } from 'lucide-react';
import { formatCount } from '@network/shared';

interface LikesViewsCountProps {
  likes: number;
  views: number;
}

const LikesViewsCount = ({ likes, views }: LikesViewsCountProps) => (
  <div className="flex shrink-0 items-center gap-3 text-sm font-medium text-text-primary">
    <span className="flex items-center gap-1">
      <Heart className="h-4 w-4 text-icon" />
      <span>{formatCount(likes)}</span>
      <span className="hidden sm:inline">Likes</span>
    </span>
    <span className="flex items-center gap-1">
      <Eye className="h-4 w-4 text-icon" />
      <span>{formatCount(views)}</span>
      <span className="hidden sm:inline">Views</span>
    </span>
  </div>
);

export default LikesViewsCount;
