import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PROFILE_TABS } from '../utils/profileTabs';
import { buildProfileTabPath } from '../utils/buildProfilePath';

export interface ProfileMobileMenuProps {
  username: string;
  isOwner: boolean;
}

const ProfileMobileMenu = ({ username, isOwner }: ProfileMobileMenuProps) => {
  const visibleTabs = PROFILE_TABS.filter((tab) => !tab.ownerOnly || isOwner);

  return (
    <div className="divide-y divide-border border-t border-border">
      {visibleTabs.map((tab) => (
        <Link
          key={tab.id}
          to={buildProfileTabPath(username, tab.id)}
          className="flex items-center justify-between gap-3 py-4 text-text-primary"
        >
          <span className="flex items-center gap-3 text-sm font-medium">
            <tab.icon className="w-4.5 h-4.5 text-icon" />
            {tab.label}
          </span>
          <ChevronRight className="w-4 h-4 text-icon" />
        </Link>
      ))}
    </div>
  );
};

export default ProfileMobileMenu;
