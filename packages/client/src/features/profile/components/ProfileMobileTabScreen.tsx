import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { buildProfilePath } from '../utils/buildProfilePath';
import { PROFILE_TABS } from '../utils/profileTabs';
import type { ProfileTab } from '@network/shared';

export interface ProfileMobileTabScreenProps {
  username: string;
  activeTab: ProfileTab;
  children: ReactNode;
}

const ProfileMobileTabScreen = ({
  username,
  activeTab,
  children,
}: ProfileMobileTabScreenProps) => {
  const tabDef = PROFILE_TABS.find((tab) => tab.id === activeTab);

  return (
    <div>
      <div className="flex items-center gap-3 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 border-b border-border">
        <Link
          to={buildProfilePath(username)}
          aria-label="Back to profile"
          className="p-1 -ml-1 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-semibold text-text-primary">
          {tabDef?.label}
        </span>
      </div>

      <div className="pt-4">{children}</div>
    </div>
  );
};

export default ProfileMobileTabScreen;
