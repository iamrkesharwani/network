import { usePreference } from '../../hooks/usePreference';
import PreferenceToggleRow from '../../components/PreferenceToggleRow';

const PreferencesTab = () => {
  const [appearance, setAppearance] = usePreference('appearance');

  return (
    <div className="max-w-lg">
      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Appearance
      </h3>

      <PreferenceToggleRow
        label="Dark theme"
        description="Switch between light and dark appearance."
        checked={(appearance.theme ?? 'dark') === 'dark'}
        onChange={(checked) =>
          setAppearance({ theme: checked ? 'dark' : 'light' })
        }
      />

      <PreferenceToggleRow
        label="Collapse sidebar"
        description="Keep the sidebar collapsed by default."
        checked={appearance.sidebarCollapsed ?? true}
        onChange={(checked) => setAppearance({ sidebarCollapsed: checked })}
      />
    </div>
  );
};

export default PreferencesTab;
