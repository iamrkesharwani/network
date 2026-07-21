import VideosTabPanel from './VideosTabPanel';
import ShortsTabPanel from './ShortsTabPanel';
import PostsTabPanel from './PostsTabPanel';
import StatsTabPanel from './StatsTabPanel';
import HistoryTabPanel from './HistoryTabPanel';
import PlaylistTabPanel from '../../playlist/components/PlaylistTabPanel';
import type { ProfileTab } from '@network/shared';

export interface ProfileTabContentProps {
  tab: ProfileTab;
  username: string;
  isOwner: boolean;
}

const ProfileTabContent = ({
  tab,
  username,
  isOwner,
}: ProfileTabContentProps) => {
  if (tab === 'videos') {
    return <VideosTabPanel username={username} isOwner={isOwner} />;
  }
  if (tab === 'shorts') {
    return <ShortsTabPanel username={username} isOwner={isOwner} />;
  }
  if (tab === 'posts') {
    return <PostsTabPanel username={username} isOwner={isOwner} />;
  }
  if (tab === 'history') {
    return <HistoryTabPanel />;
  }
  if (tab === 'playlists') {
    return <PlaylistTabPanel username={username} isOwner={isOwner} />;
  }

  return <StatsTabPanel />;
};

export default ProfileTabContent;
