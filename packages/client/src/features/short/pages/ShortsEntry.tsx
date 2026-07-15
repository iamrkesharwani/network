import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import { useLiveShortsFeed } from '../../feed/hooks/useLiveShortsFeed';
import ShortEmptyState from '../components/ShortEmptyState';

const ShortsEntry = () => {
  const { items: shorts, isLoading } = useLiveShortsFeed();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-icon" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return <ShortEmptyState />;
  }

  return (
    <Navigate
      to={CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', shorts[0].id)}
      replace
    />
  );
};

export default ShortsEntry;
