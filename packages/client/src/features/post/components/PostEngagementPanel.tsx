import { useState } from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { formatCount, type IPostResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import BottomSheet from '../../../shared/ui/overlay/BottomSheet';
import LikeButton from '../../engagement/components/LikeButton';
import ShareSheet from '../../engagement/components/ShareSheet';
import BookmarkButton from '../../engagement/components/BookmarkButton';
import CommentSection from '../../engagement/components/CommentSection';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';
import { useGetBookmarkStatusesQuery } from '../../engagement/bookmarkApi';

interface PostEngagementPanelProps {
  post: IPostResponse;
  autoOpenComments?: boolean;
  highlightCommentId?: string;
  threadRootId?: string;
}

const PostEngagementPanel = ({
  post,
  autoOpenComments = false,
  highlightCommentId,
  threadRootId,
}: PostEngagementPanelProps) => {
  const [sheetOpen, setSheetOpen] = useState(autoOpenComments);
  const isMobileLayout = useIsMobileLayout();

  const { data: likeStatusData } = useGetLikeStatusesQuery({
    contentType: 'post',
    contentIds: [post.id],
  });
  const liked = likeStatusData?.data[post.id] ?? false;

  const { data: bookmarkStatusData } = useGetBookmarkStatusesQuery({
    contentType: 'post',
    contentIds: [post.id],
  });
  const bookmarked = bookmarkStatusData?.data[post.id] ?? false;

  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwner = Boolean(currentUserId) && currentUserId === post.author.id;

  const commentsActive = isMobileLayout ? sheetOpen : true;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 rounded-lg border border-border px-3 py-2.5">
        <LikeButton
          contentType="post"
          contentId={post.id}
          initialLiked={liked}
          initialLikesCount={post.likes}
        />

        <button
          type="button"
          onClick={() => isMobileLayout && setSheetOpen(true)}
          aria-pressed={commentsActive}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
            commentsActive
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          )}
        >
          <MessageCircle className="h-4 w-4" />
          {formatCount(post.commentsCount)}
        </button>

        <ShareSheet contentType="post" contentId={post.id} compact />

        <BookmarkButton
          contentType="post"
          contentId={post.id}
          initialBookmarked={bookmarked}
        />

        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-text-muted">
          <Eye className="h-4 w-4" />
          {formatCount(post.views)}
        </span>
      </div>

      {isMobileLayout ? (
        <BottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={
            <h2 className="text-sm font-semibold text-text-primary">Comments</h2>
          }
        >
          <CommentSection
            contentType="post"
            contentId={post.id}
            canModerate={isOwner}
            highlightCommentId={highlightCommentId}
            threadRootId={threadRootId}
          />
        </BottomSheet>
      ) : (
        <div className="lg:max-h-[70vh] lg:overflow-y-auto lg:overflow-x-hidden">
          <CommentSection
            contentType="post"
            contentId={post.id}
            canModerate={isOwner}
            highlightCommentId={highlightCommentId}
            threadRootId={threadRootId}
          />
        </div>
      )}
    </div>
  );
};

export default PostEngagementPanel;
