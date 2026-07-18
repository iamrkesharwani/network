import { useState } from 'react';
import { Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import Modal from '../../../shared/ui/overlay/Modal';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import PostCard from './PostCard';
import type { IPostResponse } from '@network/shared';
import {
  CLIENT_ROUTES,
  POST_TILE_QUOTE_THRESHOLD_CHARS,
  POST_TILE_HEIGHT_PX,
} from '@network/shared';

export interface PostGridTileProps {
  post: IPostResponse;
  className?: string;
  variant?: 'preview' | 'detail';
  isOwner?: boolean;
  onDelete?: (post: IPostResponse) => Promise<void> | void;
  onToggleVisibility?: (post: IPostResponse) => Promise<void> | void;
}

const PostGridTile = ({
  post,
  className,
  variant = 'preview',
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: PostGridTileProps) => {
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);

  const text = post.text ?? '';
  const images = post.imageUrls ?? [];
  const hasImage = post.mediaType === 'image' && images.length > 0;
  const isQuote =
    !hasImage &&
    text.length > 0 &&
    text.length <= POST_TILE_QUOTE_THRESHOLD_CHARS;

  const handleOpen = () => {
    if (variant === 'detail') {
      setDetailOpen(true);
      return;
    }
    navigate(CLIENT_ROUTES.POST_WATCH.replace(':postId', post.id));
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        style={{ height: POST_TILE_HEIGHT_PX }}
        className={cn(
          'group flex flex-col w-full rounded-2xl border border-border bg-surface overflow-hidden text-left cursor-pointer hover:border-primary/50 transition-colors',
          className
        )}
      >
        <div className="p-3 sm:p-4 shrink-0">
          <CardAuthorHeader
            username={post.author.username}
            avatarUrl={post.author.avatarUrl}
            createdAt={post.createdAt}
          />
        </div>

        {hasImage ? (
          <>
            <div className="relative flex-1 min-h-0 bg-surface-raised overflow-hidden">
              <img
                src={images[0]}
                alt=""
                draggable={false}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm">
                  <Images className="w-3 h-3" strokeWidth={2} />
                  {images.length}
                </span>
              )}
            </div>
            {text && (
              <p className="px-3 sm:px-4 py-2 shrink-0 text-sm text-text-primary line-clamp-2 wrap-break-word">
                {text}
              </p>
            )}
          </>
        ) : isQuote ? (
          <div className="flex-1 min-h-0 flex items-center justify-center px-5 py-4">
            <p className="text-center text-lg sm:text-xl font-display font-medium text-text-primary leading-snug wrap-break-word line-clamp-6">
              {text}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 px-3 sm:px-4 pb-3 overflow-hidden">
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap wrap-break-word line-clamp-6">
              {text}
            </p>
          </div>
        )}
      </button>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Post"
      >
        <PostCard
          post={post}
          isOwner={isOwner}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      </Modal>
    </>
  );
};

export default PostGridTile;
