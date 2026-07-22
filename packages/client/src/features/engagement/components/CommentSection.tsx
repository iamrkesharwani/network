import type { ContentType } from '@network/shared';
import { useLiveFeed } from '../../feed/hooks/useLiveFeed';
import { useCreateCommentMutation, useListCommentsQuery } from '../commentApi';
import CommentInput from './CommentInput';
import CommentList from './CommentList';

const COMMENTS_PAGE_LIMIT = 20;

export interface CommentSectionProps {
  contentType: ContentType;
  contentId: string;
  canModerate?: boolean;
  highlightCommentId?: string;
  threadRootId?: string;
}

const CommentSection = ({
  contentType,
  contentId,
  canModerate = false,
  highlightCommentId,
  threadRootId,
}: CommentSectionProps) => {
  const [createComment] = useCreateCommentMutation();

  const { items, isLoading, isFetchingNextPage, hasNextPage, loadMore } =
    useLiveFeed(
      (args) => useListCommentsQuery({ contentType, contentId, ...args }),
      COMMENTS_PAGE_LIMIT
    );

  const handleCreate = async (text: string) => {
    await createComment({ contentType, contentId, text }).unwrap();
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="ml-0 md:ml-1 text-sm font-semibold text-text-primary">Comments</h3>
      <CommentInput mode="create" onSubmit={handleCreate} />
      <CommentList
        contentType={contentType}
        contentId={contentId}
        comments={items}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
        canModerate={canModerate}
        highlightCommentId={highlightCommentId}
        threadRootId={threadRootId}
      />
    </div>
  );
};

export default CommentSection;
