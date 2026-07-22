import { useRef } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  CLIENT_ROUTES,
  NOTIFICATION_COMMENT_PARAM,
  NOTIFICATION_THREAD_PARAM,
} from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';
import { useGetPostByIdQuery } from '../postApi';
import PostMedia from '../components/PostMedia';
import PostMetaRail from '../components/PostMetaRail';
import PostEngagementPanel from '../components/PostEngagementPanel';
import PostContinuationFeed from '../components/PostContinuationFeed';
import PostEmptyState from '../components/PostEmptyState';
import PostWatchSkeleton from '../skeleton/PostWatchSkeleton';

const PostWatch = () => {
  const { postId } = useParams<{ postId: string }>();
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const highlightCommentId = searchParams.get(NOTIFICATION_COMMENT_PARAM) ?? undefined;
  const threadRootId = searchParams.get(NOTIFICATION_THREAD_PARAM) ?? undefined;

  const { data, isLoading, isError } = useGetPostByIdQuery(postId ?? '', {
    skip: !postId,
  });
  const post = data?.data;

  const socketRef = useSocketContext();
  useContentRoom(socketRef, 'post', postId ?? '', rootRef);

  usePageTitle(post ? `Post by @${post.author.username}` : 'Post');

  if (!postId) {
    return <Navigate to={CLIENT_ROUTES.POSTS} replace />;
  }

  if (isLoading) {
    return <PostWatchSkeleton />;
  }

  if (isError || !post) {
    return (
      <PostEmptyState
        message="This post couldn't be found"
        subMessage="It may have been removed."
      />
    );
  }

  const hasMedia = post.mediaType !== 'none';

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-8">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-4">
        <div className="flex flex-col gap-3">
          {hasMedia && (
            <PostMedia
              post={post}
              className="-mx-4 max-md:w-[calc(100%+2rem)] md:-mx-5 md:-mt-5 md:max-lg:w-[calc(100%+2.5rem)] lg:mx-0 lg:mt-0 lg:w-full lg:rounded-2xl lg:border lg:border-border"
            />
          )}
          <PostMetaRail post={post} className={hasMedia ? undefined : 'flex-1'} />
        </div>

        <PostEngagementPanel
          post={post}
          autoOpenComments={Boolean(highlightCommentId)}
          highlightCommentId={highlightCommentId}
          threadRootId={threadRootId}
        />
      </div>

      <PostContinuationFeed excludeId={post.id} />
    </div>
  );
};

export default PostWatch;
