import usePageTitle from '../../../shared/hooks/usePageTitle';
import PostContinuationFeed from '../components/PostContinuationFeed';

const PostsFeedPage = () => {
  usePageTitle('Posts');

  return <PostContinuationFeed />;
};

export default PostsFeedPage;
