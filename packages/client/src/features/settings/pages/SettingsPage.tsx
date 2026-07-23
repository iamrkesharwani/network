import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';
import { getActiveSettingsTab, type SettingsTab } from '../utils/settingsTabs';
import { getActiveMyInfoSegment } from '../utils/myInfoSegments';
import SettingsNav from '../components/general/SettingsNav';
import SettingsMobileMenu from '../components/general/SettingsMobileMenu';
import SettingsMobileTabScreen from '../components/general/SettingsMobileTabScreen';
import MyInfoTab from './tabs/myInfo/MyInfoTab';
import PreferencesTab from './tabs/preference/PreferencesTab';
import PrivacyTab from './tabs/privacy/PrivacyTab';
import AccountTab from './tabs/account/AccountTab';

const renderTabContent = (tab: SettingsTab) => (
  <>
    {tab === 'my-info' && <MyInfoTab />}
    {tab === 'preferences' && <PreferencesTab />}
    {tab === 'privacy' && <PrivacyTab />}
    {tab === 'account' && <AccountTab />}
  </>
);

const SettingsPage = () => {
  usePageTitle('Settings');
  const location = useLocation();
  const isMobile = useIsMobileLayout();
  const requestedTab = getActiveSettingsTab(location.pathname);
  const isMyInfoSegment = getActiveMyInfoSegment(location.pathname) !== null;
  const username = useAppSelector((state) => state.auth.user?.username);
  const showMobileMenuHeader = isMobile && requestedTab === null;

  return (
    <div className="md:pt-0 pt-5">
      {showMobileMenuHeader && (
        <div className="max-w-4xl">
          {username && (
            <Link
              to={buildProfilePath(username)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>
          )}

          <h1 className="mb-6 font-display text-2xl font-bold text-text-primary sm:text-3xl">
            Settings
          </h1>
        </div>
      )}

      {isMobile ? (
        requestedTab === null ? (
          <SettingsMobileMenu />
        ) : isMyInfoSegment ? (
          renderTabContent(requestedTab)
        ) : (
          <SettingsMobileTabScreen>
            {renderTabContent(requestedTab)}
          </SettingsMobileTabScreen>
        )
      ) : (
        <div className="flex flex-row items-start gap-10">
          <SettingsNav activeTab={requestedTab ?? 'my-info'} />

          <div className="mx-auto w-full min-w-0 max-w-4xl flex-1">
            {renderTabContent(requestedTab ?? 'my-info')}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
