import { UserRound, SlidersHorizontal, ShieldCheck, UserCog } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';

export type SettingsTab = 'my-info' | 'preferences' | 'security' | 'account';

export interface SettingsTabDef {
  id: SettingsTab;
  label: string;
  icon: typeof UserRound;
  path: string;
}

export const SETTINGS_TABS: SettingsTabDef[] = [
  {
    id: 'my-info',
    label: 'My Info',
    icon: UserRound,
    path: CLIENT_ROUTES.SETTINGS_MY_INFO,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: SlidersHorizontal,
    path: CLIENT_ROUTES.SETTINGS_PREFERENCES,
  },
  {
    id: 'security',
    label: 'Security',
    icon: ShieldCheck,
    path: CLIENT_ROUTES.SETTINGS_SECURITY,
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserCog,
    path: CLIENT_ROUTES.SETTINGS_ACCOUNT,
  },
];

export const getActiveSettingsTab = (pathname: string): SettingsTab => {
  if (pathname.endsWith('/preferences')) return 'preferences';
  if (pathname.endsWith('/security')) return 'security';
  if (pathname.endsWith('/account')) return 'account';
  return 'my-info';
};
