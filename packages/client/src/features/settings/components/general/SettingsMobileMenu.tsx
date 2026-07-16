import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SETTINGS_TABS } from '../../utils/settingsTabs';

const SettingsMobileMenu = () => (
  <div className="divide-y divide-border border-t border-border">
    {SETTINGS_TABS.map((tab) => (
      <Link
        key={tab.id}
        to={tab.path}
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

export default SettingsMobileMenu;
