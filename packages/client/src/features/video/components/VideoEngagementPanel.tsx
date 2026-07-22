import { AnimatePresence, motion } from 'framer-motion';
import { Eye, MessageCircle } from 'lucide-react';
import { formatCount, type IVideoResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import BottomSheet from '../../../shared/ui/overlay/BottomSheet';
import LikeButton from '../../engagement/components/LikeButton';
import ShareSheet from '../../engagement/components/ShareSheet';
import BookmarkButton from '../../engagement/components/BookmarkButton';
import CommentSection from '../../engagement/components/CommentSection';
import PlaylistMenu from '../../playlist/components/PlaylistMenu';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';
import { useGetBookmarkStatusesQuery } from '../../engagement/bookmarkApi';
import MentionedText from '../../../shared/ui/primitives/MentionedText';

export type VideoEngagementActivePanel = 'comments' | 'description' | null;

interface VideoEngagementPanelProps {
  video: IVideoResponse;
  activePanel: VideoEngagementActivePanel;
  onToggleComments: () => void;
  onToggleDescription: () => void;
  highlightCommentId?: string;
  threadRootId?: string;
}

const VideoEngagementPanel = ({
  video,
  activePanel,
  onToggleComments,
  onToggleDescription,
  highlightCommentId,
  threadRootId,
}: VideoEngagementPanelProps) => {
  const { data: likeStatusData } = useGetLikeStatusesQuery({
    contentType: 'video',
    contentIds: [video.id],
  });
  const liked = likeStatusData?.data[video.id] ?? false;
  const { data: bookmarkStatusData } = useGetBookmarkStatusesQuery({
    contentType: 'video',
    contentIds: [video.id],
  });
  const bookmarked = bookmarkStatusData?.data[video.id] ?? false;
  const { reduce } = useMotionSafe();
  const isMobileLayout = useIsMobileLayout();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isVideoOwner = Boolean(currentUserId) && currentUserId === video.author.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 rounded-lg border border-border px-3 py-2.5">
        <LikeButton
          contentType="video"
          contentId={video.id}
          initialLiked={liked}
          initialLikesCount={video.likes}
          size="sm"
        />

        <button
          type="button"
          onClick={onToggleComments}
          aria-pressed={activePanel === 'comments'}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
            activePanel === 'comments'
              ? 'text-primary'
              : 'text-text-muted hover:text-text-primary'
          )}
        >
          <MessageCircle className="h-4 w-4" />
          {formatCount(video.commentsCount)}
        </button>

        <ShareSheet contentType="video" contentId={video.id} compact />

        <PlaylistMenu contentType="video" contentId={video.id} />

        <BookmarkButton
          contentType="video"
          contentId={video.id}
          initialBookmarked={bookmarked}
          size="sm"
        />

        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-text-muted">
          <Eye className="h-4 w-4" />
          {formatCount(video.views)}
        </span>
      </div>

      {isMobileLayout ? (
        <>
          <BottomSheet
            isOpen={activePanel === 'comments'}
            onClose={onToggleComments}
            title={
              <h2 className="text-sm font-semibold text-text-primary">
                Comments
              </h2>
            }
          >
            <CommentSection
              contentType="video"
              contentId={video.id}
              canModerate={isVideoOwner}
              highlightCommentId={highlightCommentId}
              threadRootId={threadRootId}
            />
          </BottomSheet>

          <BottomSheet
            isOpen={activePanel === 'description'}
            onClose={onToggleDescription}
            title={
              <h2 className="truncate text-sm font-semibold text-text-primary">
                {video.title}
              </h2>
            }
          >
            <p className="whitespace-pre-wrap wrap-break-word text-sm text-text-secondary">
              {video.description ? (
                <MentionedText text={video.description} />
              ) : (
                'No description'
              )}
            </p>
          </BottomSheet>
        </>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {activePanel === 'comments' && (
            <motion.div
              key="comments"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={SPRINGS.smooth}
              className="lg:max-h-[70vh] lg:overflow-y-auto lg:overflow-x-hidden"
            >
              <CommentSection
                contentType="video"
                contentId={video.id}
                canModerate={isVideoOwner}
                highlightCommentId={highlightCommentId}
                threadRootId={threadRootId}
              />
            </motion.div>
          )}

          {activePanel === 'description' && (
            <motion.div
              key="description"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={SPRINGS.smooth}
              className="lg:max-h-[70vh] lg:overflow-y-auto lg:overflow-x-hidden"
            >
              <p className="whitespace-pre-wrap wrap-break-word rounded-lg border border-border px-3 py-2.5 text-sm text-text-secondary">
                {video.description ? (
                <MentionedText text={video.description} />
              ) : (
                'No description'
              )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default VideoEngagementPanel;
