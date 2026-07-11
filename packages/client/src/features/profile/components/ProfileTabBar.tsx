import { Link } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import { PROFILE_TABS, type ProfileTab } from '../utils/profileTabs';
import { buildProfileTabPath } from '../utils/buildProfilePath';

export interface ProfileTabBarProps {
  username: string;
  activeTab: ProfileTab;
  isOwner: boolean;
}

const ProfileTabBar = ({ username, activeTab, isOwner }: ProfileTabBarProps) => {
  const visibleTabs = PROFILE_TABS.filter((tab) => !tab.ownerOnly || isOwner);

  return (
    <div className="flex items-center gap-1 border-b border-border">
      {visibleTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            to={buildProfileTabPath(username, tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileTabBar;
