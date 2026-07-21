import { useRef, useState } from 'react';
import { Images, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import Modal from '../../../shared/ui/overlay/Modal';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import ConfirmSaveDiscardModal from '../../../shared/ui/overlay/ConfirmSaveDiscardModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import PostEditForm from '../form/PostEditForm';
import LikeButton from '../../engagement/components/LikeButton';
import ShareSheet from '../../engagement/components/ShareSheet';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import type { IPostResponse } from '@network/shared';
import {
  CLIENT_ROUTES,
  POST_TILE_QUOTE_THRESHOLD_CHARS,
  POST_TILE_HEIGHT_PX,
  formatCount,
} from '@network/shared';
import {
  useUnsavedChangesGuard,
  type EditFormHandle,
} from '../../../shared/hooks/useUnsavedChangesGuard';

export interface PostGridTileProps {
  post: IPostResponse;
  className?: string;
  isOwner?: boolean;
  onDelete?: (post: IPostResponse) => Promise<void> | void;
  onToggleVisibility?: (post: IPostResponse) => Promise<void> | void;
}

const PostGridTile = ({
  post,
  className,
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: PostGridTileProps) => {
  const navigate = useNavigate();
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editFormRef = useRef<EditFormHandle>(null);
  const editGuard = useUnsavedChangesGuard(editFormRef, () =>
    setEditModalOpen(false)
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const socketRef = useSocketContext();
  useContentRoom(socketRef, 'post', post.id, cardRef);

  const { data: likeStatusData } = useGetLikeStatusesQuery({
    contentType: 'post',
    contentIds: [post.id],
  });
  const liked = likeStatusData?.data[post.id] ?? false;

  const text = post.text ?? '';
  const images = post.imageUrls ?? [];
  const hasImage = post.mediaType === 'image' && images.length > 0;
  const isQuote =
    !hasImage &&
    text.length > 0 &&
    text.length <= POST_TILE_QUOTE_THRESHOLD_CHARS;
  const isUnlisted = post.visibility === 'unlisted';

  const handleOpen = () => {
    navigate(CLIENT_ROUTES.POST_WATCH.replace(':postId', post.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleEditConfirm = () => {
    setEditConfirmOpen(false);
    setEditModalOpen(true);
  };

  const handleVisibilityConfirm = async () => {
    if (!onToggleVisibility) {
      setVisibilityConfirmOpen(false);
      return;
    }
    setIsTogglingVisibility(true);
    try {
      await onToggleVisibility(post);
      setVisibilityConfirmOpen(false);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) {
      setDeleteConfirmOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(post);
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const authorHeader = (
    <CardAuthorHeader
      username={post.author.username}
      avatarUrl={post.author.avatarUrl}
      createdAt={post.createdAt}
      menu={
        <CardOptionsMenu
          itemLabel="Post"
          isOwner={isOwner}
          onEdit={() => setEditConfirmOpen(true)}
          onDeleteClick={() => setDeleteConfirmOpen(true)}
          visibilityAction={{
            label: isUnlisted ? 'Make public' : 'Make unlisted',
            toPublic: isUnlisted,
            onClick: () => setVisibilityConfirmOpen(true),
          }}
        />
      }
    />
  );

  const engagementRow = (
    <div className="flex items-center gap-4">
      <div onClick={(e) => e.stopPropagation()}>
        <LikeButton
          contentType="post"
          contentId={post.id}
          initialLiked={liked}
          initialLikesCount={post.likes}
          size="sm"
        />
      </div>

      {post.commentsCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted">
          <MessageCircle className="w-4 h-4" strokeWidth={2} />
          {formatCount(post.commentsCount)}
        </span>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <ShareSheet contentType="post" contentId={post.id} compact />
      </div>

      {post.views > 0 && (
        <span className="ml-auto text-xs text-text-muted">
          {formatCount(post.views)} views
        </span>
      )}
    </div>
  );

  return (
    <>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        style={{ height: POST_TILE_HEIGHT_PX }}
        className={cn(
          'group flex flex-col w-full rounded-2xl border border-border bg-surface overflow-hidden text-left cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className
        )}
      >
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

            <div className="shrink-0 flex flex-col gap-2 p-3 sm:p-4 border-t border-border">
              {authorHeader}
              {text && (
                <p className="text-sm text-text-primary line-clamp-1 wrap-break-word">
                  {text}
                </p>
              )}
              {engagementRow}
            </div>
          </>
        ) : (
          <>
            <div className="p-3 sm:p-4 shrink-0">{authorHeader}</div>

            {isQuote ? (
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

            <div className="px-3 sm:px-4 py-2.5 shrink-0 border-t border-border">
              {engagementRow}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        onConfirm={handleEditConfirm}
        intent="info"
        title="Edit this post?"
        description="You'll be taken to the edit form."
        confirmLabel="Edit"
      />

      <ConfirmModal
        isOpen={visibilityConfirmOpen}
        onClose={() => setVisibilityConfirmOpen(false)}
        onConfirm={handleVisibilityConfirm}
        intent="info"
        title={
          isUnlisted ? 'Make this post public?' : 'Make this post unlisted?'
        }
        description={
          isUnlisted
            ? 'Make this public now to keep it — otherwise it is automatically deleted in a few days.'
            : 'Only you will be able to see this. It will be automatically deleted after 7 days unless you make it public again.'
        }
        confirmLabel={isUnlisted ? 'Make public' : 'Make unlisted'}
        isLoading={isTogglingVisibility}
      />

      <MultiStepConfirmDelete
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="post"
        itemName={post.text?.slice(0, 40) || 'this post'}
        isLoading={isDeleting}
      />

      <Modal
        isOpen={editModalOpen}
        onClose={editGuard.requestClose}
        title="Edit post"
      >
        <PostEditForm
          ref={editFormRef}
          postId={post.id}
          initialValues={{
            text: post.text,
            tags: post.tags,
            visibility: post.visibility,
          }}
          onSuccess={() => setEditModalOpen(false)}
        />
      </Modal>

      <ConfirmSaveDiscardModal
        isOpen={editGuard.isConfirmOpen}
        itemLabel="post"
        onKeepEditing={editGuard.keepEditing}
        onDiscard={editGuard.discard}
        onSave={editGuard.save}
      />
    </>
  );
};

export default PostGridTile;
