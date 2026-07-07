import {
  TEXT_TRUNCATE_LENGTH,
  type IPostResponse,
} from '../../../../../shared/src';
import React, { useState } from 'react';
import { EyeOff, Play } from 'lucide-react';

interface PostCardProps {
  post: IPostResponse;
}

const PostCard = ({ post }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const text = post.text ?? '';
  const isLong = text.length > TEXT_TRUNCATE_LENGTH;
  const displayText =
    expanded || !isLong
      ? text
      : `${text.slice(0, TEXT_TRUNCATE_LENGTH).trimEnd()}…`;

  const isVideoProcessing =
    post.mediaType === 'video' && post.status !== 'READY';

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  return (
    <div className="flex flex-col gap-3">
      {text && (
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap wrap-break-word">
          {displayText}
          {isLong && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="ml-1.5 font-medium text-primary hover:underline focus:outline-none cursor-pointer"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>
      )}

      {post.mediaType === 'image' && post.imageUrl && !thumbError && (
        <div className="rounded-xl overflow-hidden bg-surface-raised">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            onError={() => setThumbError(true)}
            draggable={false}
            className="w-full max-h-128 object-cover"
          />
        </div>
      )}

      {post.mediaType === 'video' && (
        <div className="relative rounded-xl overflow-hidden bg-surface-raised aspect-video">
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
      )}

      {post.visibility !== 'public' && (
        <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-raised text-text-muted border border-border">
          <EyeOff className="w-3 h-3" strokeWidth={2} />
          {post.visibility === 'private' ? 'Private' : 'Unlisted'}
        </span>
      )}
    </div>
  );
};

export default PostCard;
