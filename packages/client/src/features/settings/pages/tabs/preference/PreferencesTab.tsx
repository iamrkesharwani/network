import { PREFERENCES_DEFAULT_PLAYBACK_RATE } from '@network/shared';
import { usePreference } from '../../../hooks/usePreference';
import PreferenceOptionCard from '../../../components/preferences/PreferenceOptionCard';
import PreferenceSwitch from '../../../components/preferences/PreferenceSwitch';
import PlaybackSpeedControl from '../../../components/preferences/PlaybackSpeedControl';

const PreferencesTab = () => {
  const [appearance, setAppearance] = usePreference('appearance');
  const [playback, setPlayback] = usePreference('playback');
  const [layout, setLayout] = usePreference('layout');

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Preferences
      </h2>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Appearance
      </h3>
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        <PreferenceOptionCard
          label="Dark theme"
          description="Switch between light and dark appearance."
        >
          <PreferenceSwitch
            label="Dark theme"
            checked={(appearance.theme ?? 'dark') === 'dark'}
            onChange={(checked) =>
              setAppearance({ theme: checked ? 'dark' : 'light' })
            }
          />
        </PreferenceOptionCard>

        <PreferenceOptionCard
          label="Collapse sidebar"
          description="Keep the sidebar collapsed by default."
        >
          <PreferenceSwitch
            label="Collapse sidebar"
            checked={appearance.sidebarCollapsed ?? true}
            onChange={(checked) => setAppearance({ sidebarCollapsed: checked })}
          />
        </PreferenceOptionCard>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">Playback</h3>
      <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        <PreferenceOptionCard
          label="Playback speed"
          description="Default speed for videos."
        >
          <PlaybackSpeedControl
            value={playback.playbackRate ?? PREFERENCES_DEFAULT_PLAYBACK_RATE}
            onChange={(rate) => setPlayback({ playbackRate: rate })}
          />
        </PreferenceOptionCard>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">Shorts</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PreferenceOptionCard
          label="Comments expanded by default"
          description="Show the comments panel already open when watching shorts on tablet/desktop."
        >
          <PreferenceSwitch
            label="Comments expanded by default"
            checked={layout.shortsCommentsOpen ?? false}
            onChange={(checked) => setLayout({ shortsCommentsOpen: checked })}
          />
        </PreferenceOptionCard>
      </div>
    </div>
  );
};

export default PreferencesTab;
