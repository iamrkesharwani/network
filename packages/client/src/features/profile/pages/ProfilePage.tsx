import { useLocation, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';

type ProfileTab = 'videos' | 'shorts' | 'posts' | 'stats';

const getActiveTab = (pathname: string): ProfileTab => {
  if (pathname.endsWith('/shorts')) return 'shorts';
  if (pathname.endsWith('/posts')) return 'posts';
  if (pathname.endsWith('/stats')) return 'stats';
  return 'videos';
};

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const authUser = useAppSelector((state) => state.auth.user);

  const activeTab = getActiveTab(location.pathname);
  const isOwner = authUser?.username === username;

  return (
    <div className="p-6">
      <p className="text-text-secondary text-sm">
        Profile scaffold for @{username} — active tab: {activeTab}
        {isOwner ? ' (owner view)' : ''}
      </p>
    </div>
  );
};

export default ProfilePage;
