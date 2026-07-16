import { Link } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import { SETTINGS_TABS, type SettingsTab } from '../utils/settingsTabs';

interface SettingsNavProps {
  activeTab: SettingsTab;
}

const SettingsNav = ({ activeTab }: SettingsNavProps) => (
  <div className="sticky top-14 flex w-56 shrink-0 flex-col gap-2">
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

export default SettingsNav;
