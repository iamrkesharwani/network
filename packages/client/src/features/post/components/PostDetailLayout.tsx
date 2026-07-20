import type { IPostResponse } from '@network/shared';
import PostCard from '../pages/PostCard';
import CommentSection from '../../engagement/components/CommentSection';

export interface PostDetailLayoutProps {
  post: IPostResponse;
  isOwner?: boolean;
  onDelete?: (post: IPostResponse) => Promise<void> | void;
  onToggleVisibility?: (post: IPostResponse) => Promise<void> | void;
}

const PostDetailLayout = ({
  post,
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: PostDetailLayoutProps) => {
  const hasMedia = post.mediaType !== 'none';

  return (
    <PostCard
      post={post}
      isOwner={isOwner}
      onDelete={onDelete}
      onToggleVisibility={onToggleVisibility}
      layout={hasMedia ? 'split' : 'stacked'}
      belowFooter={<CommentSection contentType="post" contentId={post.id} />}
    />
  );
};

export default PostDetailLayout;
