import { Link } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import { SETTINGS_TABS, type SettingsTab } from '../utils/settingsTabs';

interface SettingsNavProps {
  activeTab: SettingsTab;
}

const SettingsNav = ({ activeTab }: SettingsNavProps) => (
  <div className="flex items-center gap-1 border-b border-border md:flex-col md:items-stretch md:gap-0.5 md:border-b-0 md:border-r md:pr-4">
    {SETTINGS_TABS.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <Link
          key={tab.id}
          to={tab.path}
          className={cn(
            'flex items-center gap-2 border-b-2 -mb-px px-4 py-2.5 text-sm font-medium transition-colors',
            'md:mb-0 md:rounded-lg md:border-b-0 md:px-3',
            isActive
              ? 'border-primary text-primary md:bg-primary-subtle'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Link>
      );
    })}
  </div>
);

export default SettingsNav;
