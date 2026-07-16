import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { buildProfilePath } from '../../../profile/utils/buildProfilePath';
import { SETTINGS_TABS, type SettingsTab } from '../../utils/settingsTabs';

interface SettingsNavProps {
  activeTab: SettingsTab;
}

const SettingsNav = ({ activeTab }: SettingsNavProps) => {
  const username = useAppSelector((state) => state.auth.user?.username);

  return (
    <div className="sticky top-14 flex w-56 shrink-0 flex-col gap-2">
      {username && (
        <Link
          to={buildProfilePath(username)}
          className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      )}

      <h1 className="mb-4 font-display text-2xl font-bold text-text-primary">
        Settings
      </h1>

      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-subtle text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
            )}
          >
            <tab.icon className="h-4.5 w-4.5" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default SettingsNav;
