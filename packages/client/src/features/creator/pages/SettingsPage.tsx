import usePageTitle from '../../../shared/hooks/usePageTitle';

const SettingsPage = () => {
  usePageTitle('Settings');
  return <div className="p-8 text-xl">Settings</div>;
};

export default SettingsPage;
