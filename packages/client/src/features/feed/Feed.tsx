import usePageTitle from '../../shared/hooks/usePageTitle';
import FeedRenderer from './components/FeedRenderer';

const Feed = () => {
  usePageTitle('Home');

  return (
    <FeedRenderer
      source={{ mode: 'global' }}
      emptyMessage="No content yet"
      emptySubMessage="When content is added it'll appear here."
    />
  );
};

export default Feed;
