import { useState } from 'react';
import { Play } from 'lucide-react';
import type { IPostResponse } from '@network/shared';
import MediaVisibilityBadge from '../../../shared/ui-kit/MediaVisibilityBadge';

interface PostMediaProps {
  post: IPostResponse;
}

const PostMedia = ({ post }: PostMediaProps) => {
  const [thumbError, setThumbError] = useState(false);
  const isVideoProcessing =
    post.mediaType === 'video' && post.status !== 'READY';

  if (post.mediaType === 'image' && post.imageUrl && !thumbError) {
    return (
      <div className="relative bg-surface-raised">
        <img
          src={post.imageUrl}
          alt="Post attachment"
          onError={() => setThumbError(true)}
          draggable={false}
          className="w-full max-h-128 object-cover"
        />
        <MediaVisibilityBadge visibility={post.visibility} />
      </div>
    );
  }

  if (post.mediaType === 'video') {
    return (
      <div className="relative bg-surface-raised aspect-video">
        {post.playbackUrl && post.status === 'READY' ? (
          <video
            src={post.playbackUrl}
            poster={post.thumbnailUrl}
            controls
            className="w-full h-full object-cover"
          />
        ) : post.thumbnailUrl && !thumbError ? (
          <img
            src={post.thumbnailUrl}
            alt="Post video thumbnail"
            onError={() => setThumbError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play
              className="w-10 h-10 text-text-muted opacity-40"
              strokeWidth={1.5}
            />
          </div>
        )}

        <MediaVisibilityBadge visibility={post.visibility} />

        {isVideoProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70 backdrop-blur-[2px]">
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay text-text-secondary border border-border capitalize tracking-wide">
              {post.status === 'FAILED'
                ? '⚠ Processing failed'
                : post.status.toLowerCase()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PostMedia;
