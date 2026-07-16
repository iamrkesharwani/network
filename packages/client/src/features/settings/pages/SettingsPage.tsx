import { useLocation } from 'react-router-dom';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { getActiveSettingsTab } from '../utils/settingsTabs';
import SettingsNav from '../components/SettingsNav';
import MyInfoTab from './tabs/MyInfoTab';
import PreferencesTab from './tabs/PreferencesTab';
import AccountTab from './tabs/account/AccountTab';

const SettingsPage = () => {
  usePageTitle('Settings');
  const location = useLocation();
  const activeTab = getActiveSettingsTab(location.pathname);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
      <SettingsNav activeTab={activeTab} />

      <div className="mx-auto w-full min-w-0 max-w-2xl flex-1 pt-6 md:pt-0">
        {activeTab === 'my-info' && <MyInfoTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
        {activeTab === 'account' && <AccountTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
