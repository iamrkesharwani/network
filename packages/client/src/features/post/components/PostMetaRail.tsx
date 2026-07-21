import { useEffect, useRef, useState } from 'react';
import { EyeOff } from 'lucide-react';
import {
  POST_TEXT_LINE_CLAMP,
  formatDaysLeft,
  type IPostResponse,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';

interface PostMetaRailProps {
  post: IPostResponse;
  className?: string;
}

const heroTextClass = (length: number): string => {
  if (length <= 60) return 'text-3xl sm:text-4xl text-center';
  if (length <= 140) return 'text-2xl sm:text-3xl text-center';
  if (length <= 280) return 'text-xl sm:text-2xl text-center';
  if (length <= 500) return 'text-lg sm:text-xl text-center';
  return 'text-base sm:text-lg text-left';
};

const PostMetaRail = ({ post, className }: PostMetaRailProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const text = post.text ?? '';
  const hasMedia = post.mediaType !== 'none';
  const isUnlisted = post.visibility === 'unlisted';
  const daysLeft = isUnlisted ? formatDaysLeft(post.unlistedAt) : null;

  useEffect(() => {
    if (!hasMedia) return;
    const el = textRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight);
  }, [text, expanded, hasMedia]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <CardAuthorHeader
        username={post.author.username}
        avatarUrl={post.author.avatarUrl}
        createdAt={post.createdAt}
      />

      {text &&
        (hasMedia ? (
          <div className="flex flex-col gap-1">
            <p
              ref={textRef}
              className={cn(
                'text-sm leading-relaxed text-text-primary whitespace-pre-wrap wrap-break-word',
                !expanded && `line-clamp-${POST_TEXT_LINE_CLAMP}`
              )}
            >
              {text}
            </p>

            {(isClamped || expanded) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="self-start text-sm font-medium text-primary hover:underline focus:outline-none cursor-pointer"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-1 min-h-[280px] items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-surface-raised via-surface-raised to-surface-overlay p-6 sm:p-10">
            <p
              className={cn(
                'font-display font-medium leading-snug text-text-primary whitespace-pre-wrap wrap-break-word',
                heroTextClass(text.length)
              )}
            >
              {text}
            </p>
          </div>
        ))}

      {!hasMedia && post.visibility !== 'public' && (
        <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-raised text-text-muted border border-border">
          <EyeOff className="w-3 h-3" strokeWidth={2} />
          Unlisted
          {daysLeft !== null &&
            ` · ${daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}`}
        </span>
      )}
    </div>
  );
};

export default PostMetaRail;
