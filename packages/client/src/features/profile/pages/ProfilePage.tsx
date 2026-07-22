import { Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useGetPublicProfileByUsernameQuery } from '../../creator/creatorApi';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabBar from '../components/ProfileTabBar';
import ProfileMobileMenu from '../components/ProfileMobileMenu';
import ProfileMobileTabScreen from '../components/ProfileMobileTabScreen';
import ProfileTabContent from '../components/ProfileTabContent';
import { getActiveProfileTab, PROFILE_TABS } from '../utils/profileTabs';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const authUser = useAppSelector((state) => state.auth.user);
  const isMobile = useIsMobileLayout();

  const { data, isLoading, isError } = useGetPublicProfileByUsernameQuery(
    username ?? '',
    { skip: !username }
  );

  usePageTitle(username ? `@${username}` : 'Profile');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data || !username) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">
        This profile doesn't exist.
      </p>
    );
  }

  const profile = data.data;
  const isOwner = authUser?.username === profile.username;

  const requestedTab = getActiveProfileTab(location.pathname);
  const requestedTabDef = PROFILE_TABS.find((tab) => tab.id === requestedTab);
  const activeTab =
    requestedTabDef?.ownerOnly && !isOwner ? null : requestedTab;

  return (
    <div>
      <ProfileHeader profile={profile} isOwner={isOwner} />

      {isMobile ? (
        activeTab === null ? (
          <ProfileMobileMenu username={username} isOwner={isOwner} />
        ) : (
          <ProfileMobileTabScreen username={username} activeTab={activeTab}>
            <ProfileTabContent
              tab={activeTab}
              username={username}
              isOwner={isOwner}
            />
          </ProfileMobileTabScreen>
        )
      ) : (
        <div className="mt-2">
          <ProfileTabBar
            username={username}
            activeTab={activeTab ?? 'videos'}
            isOwner={isOwner}
          />
          <div className="pt-6">
            <ProfileTabContent
              tab={activeTab ?? 'videos'}
              username={username}
              isOwner={isOwner}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
