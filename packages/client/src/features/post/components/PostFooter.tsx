import { useEffect, useRef, useState } from 'react';
import { EyeOff } from 'lucide-react';
import { POST_TEXT_LINE_CLAMP, formatCount } from '@network/shared';
import type { IPostResponse } from '@network/shared';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';
import LikeButton from '../../engagement/components/LikeButton';
import ShareSheet from '../../engagement/components/ShareSheet';

interface PostFooterProps {
  post: IPostResponse;
  daysLeft?: number | null;
}

const PostFooter = ({ post, daysLeft }: PostFooterProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const { data: likeStatusData } = useGetLikeStatusesQuery({
    contentType: 'post',
    contentIds: [post.id],
  });
  const liked = likeStatusData?.data[post.id] ?? false;

  const text = post.text ?? '';

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight);
  }, [text]);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const hasMedia = post.mediaType !== 'none';

  return (
    <div className="flex flex-col gap-3">
      {text && (
        <p
          ref={textRef}
          className={`text-sm text-text-primary leading-relaxed whitespace-pre-wrap wrap-break-word ${
            expanded ? '' : `line-clamp-${POST_TEXT_LINE_CLAMP}`
          }`}
        >
          {text}
        </p>
      )}

      {(isClamped || expanded) && (
        <button
          type="button"
          onClick={toggleExpanded}
          className="self-start text-sm font-medium text-primary hover:underline focus:outline-none cursor-pointer"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {!hasMedia && post.visibility !== 'public' && (
        <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-raised text-text-muted border border-border">
          <EyeOff className="w-3 h-3" strokeWidth={2} />
          Unlisted
          {daysLeft !== undefined &&
            daysLeft !== null &&
            ` · ${daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}`}
        </span>
      )}

      {post.views > 0 && (
        <p className="text-xs text-text-muted">
          {formatCount(post.views)} views
        </p>
      )}

      <div className="flex items-center gap-4 pt-1">
        <LikeButton
          contentType="post"
          contentId={post.id}
          initialLiked={liked}
          initialLikesCount={post.likes}
        />
        {post.commentsCount > 0 && (
          <span className="text-sm font-medium text-text-muted">
            {formatCount(post.commentsCount)} comments
          </span>
        )}
        <ShareSheet contentType="post" contentId={post.id} compact />
      </div>
    </div>
  );
};

export default PostFooter;
