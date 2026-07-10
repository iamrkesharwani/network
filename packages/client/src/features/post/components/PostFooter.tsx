import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import { TEXT_TRUNCATE_LENGTH, formatCount } from '@network/shared';
import type { IPostResponse } from '@network/shared';

interface PostFooterProps {
  post: IPostResponse;
}

const PostFooter = ({ post }: PostFooterProps) => {
  const [expanded, setExpanded] = useState(false);

  const text = post.text ?? '';
  const isLong = text.length > TEXT_TRUNCATE_LENGTH;
  const displayText =
    expanded || !isLong
      ? text
      : `${text.slice(0, TEXT_TRUNCATE_LENGTH).trimEnd()}…`;

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const hasMedia = post.mediaType !== 'none';

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

      {!hasMedia && post.visibility !== 'public' && (
        <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-raised text-text-muted border border-border">
          <EyeOff className="w-3 h-3" strokeWidth={2} />
          {post.visibility === 'private' ? 'Private' : 'Unlisted'}
        </span>
      )}

      {post.views > 0 && (
        <p className="text-xs text-text-muted">
          {formatCount(post.views)} views
        </p>
      )}
    </div>
  );
};

export default PostFooter;
