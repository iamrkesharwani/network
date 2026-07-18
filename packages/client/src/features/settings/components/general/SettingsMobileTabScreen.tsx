import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { CLIENT_ROUTES } from '@network/shared';

export interface SettingsMobileTabScreenProps {
  children: ReactNode;
}

const SettingsMobileTabScreen = ({
  children,
}: SettingsMobileTabScreenProps) => (
  <div>
    <Link
      to={CLIENT_ROUTES.SETTINGS}
      aria-label="Back to settings"
      className="inline-flex p-1 -ml-1 rounded-lg text-icon hover:text-icon-hover hover:bg-surface-raised transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </Link>

    <div className="pt-2">{children}</div>
  </div>
);

export default SettingsMobileTabScreen;
