import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import { getActiveSettingsTab } from '../utils/settingsTabs';
import SettingsNav from '../components/SettingsNav';
import MyInfoTab from './tabs/myInfo/MyInfoTab';
import PreferencesTab from './tabs/PreferencesTab';
import AccountTab from './tabs/account/AccountTab';

const SettingsPage = () => {
  usePageTitle('Settings');
  const location = useLocation();
  const activeTab = getActiveSettingsTab(location.pathname);
  const username = useAppSelector((state) => state.auth.user?.username);

  return (
    <div className="md:pt-0 pt-5">
      {username && (
        <Link
          to={buildProfilePath(username)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <SettingsNav activeTab={activeTab} />

        <div className="mx-auto w-full min-w-0 max-w-2xl flex-1 pt-6 md:pt-0">
          {activeTab === 'my-info' && <MyInfoTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
