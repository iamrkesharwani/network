import { useState } from 'react';
import type { IPostResponse } from '@network/shared';
import MediaVisibilityBadge from '../../../shared/ui/card/MediaVisibilityBadge';
import UnlistedCountdownBadge from '../../../shared/ui/card/UnlistedCountdownBadge';

interface PostMediaProps {
  post: IPostResponse;
  daysLeft?: number | null;
}

const PostMedia = ({ post, daysLeft }: PostMediaProps) => {
  const [thumbError, setThumbError] = useState(false);

  if (post.mediaType === 'image' && post.imageUrl && !thumbError) {
    return (
      <div className="relative bg-surface-raised aspect-video">
        <img
          src={post.imageUrl}
          alt="Post attachment"
          onError={() => setThumbError(true)}
          draggable={false}
          className="w-full h-full object-cover"
        />
        <MediaVisibilityBadge visibility={post.visibility} />
        {daysLeft !== undefined && daysLeft !== null && (
          <UnlistedCountdownBadge daysLeft={daysLeft} />
        )}
      </div>
    );
  }

  return null;
};

export default PostMedia;
