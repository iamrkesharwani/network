import { Link } from 'react-router-dom';
import {
  CLIENT_ROUTES,
  PRIVACY_MESSAGE_AUDIENCES,
  PRIVACY_GROUP_ADD_AUDIENCES,
} from '@network/shared';
import { useAppSelector } from '../../../../../shared/hooks/useAppSelector';
import { usePreference } from '../../../hooks/usePreference';
import { usePatchAccountPrivacyMutation } from '../../../settingsApi';
import PreferenceOptionCard from '../../../components/preferences/PreferenceOptionCard';
import PreferenceSwitch from '../../../components/preferences/PreferenceSwitch';
import PreferenceSelect from '../../../components/preferences/PreferenceSelect';

const AUDIENCE_LABELS: Record<
  (typeof PRIVACY_MESSAGE_AUDIENCES)[number] | (typeof PRIVACY_GROUP_ADD_AUDIENCES)[number],
  string
> = {
  everyone: 'Everyone',
  followers: 'My followers',
  nobody: 'Nobody',
};

const MESSAGE_AUDIENCE_OPTIONS = PRIVACY_MESSAGE_AUDIENCES.map((value) => ({
  value,
  label: AUDIENCE_LABELS[value],
}));

const GROUP_ADD_AUDIENCE_OPTIONS = PRIVACY_GROUP_ADD_AUDIENCES.map((value) => ({
  value,
  label: AUDIENCE_LABELS[value],
}));

const PrivacyTab = () => {
  const [privacy, setPrivacy] = usePreference('privacy');
  const user = useAppSelector((state) => state.auth.user);
  const [patchAccountPrivacy, { isLoading: isUpdatingAccountPrivacy }] =
    usePatchAccountPrivacyMutation();

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Privacy
      </h2>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Account visibility
      </h3>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <PreferenceOptionCard
          label="Private account"
          description="Only approved followers can see your posts, videos, and shorts. Your name, photo, and bio stay visible to everyone."
        >
          <PreferenceSwitch
            label="Private account"
            checked={user?.isPrivate ?? false}
            onChange={(checked) => {
              void patchAccountPrivacy({ isPrivate: checked });
            }}
          />
        </PreferenceOptionCard>
        {isUpdatingAccountPrivacy && (
          <span className="sr-only" role="status">
            Updating account visibility…
          </span>
        )}
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">Messaging</h3>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <PreferenceOptionCard
          label="Who can message me"
          description="Choose who can start a new conversation with you. Existing conversations are never affected."
        >
          <PreferenceSelect
            label="Who can message me"
            value={privacy.whoCanMessageMe ?? 'everyone'}
            options={MESSAGE_AUDIENCE_OPTIONS}
            onChange={(value) => setPrivacy({ whoCanMessageMe: value })}
          />
        </PreferenceOptionCard>

        <PreferenceOptionCard
          label="Who can add me to a group"
          description="Choose who can add you to a group conversation."
        >
          <PreferenceSelect
            label="Who can add me to a group"
            value={privacy.whoCanAddToGroup ?? 'everyone'}
            options={GROUP_ADD_AUDIENCE_OPTIONS}
            onChange={(value) => setPrivacy({ whoCanAddToGroup: value })}
          />
        </PreferenceOptionCard>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Activity status
      </h3>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <PreferenceOptionCard
          label="Read receipts"
          description="Let others see when you've read their messages. Turning this off also hides when others have read yours."
        >
          <PreferenceSwitch
            label="Read receipts"
            checked={privacy.readReceipts ?? true}
            onChange={(checked) => setPrivacy({ readReceipts: checked })}
          />
        </PreferenceOptionCard>

        <PreferenceOptionCard
          label="Last seen & online status"
          description="Show others when you were last active or currently online."
        >
          <PreferenceSwitch
            label="Last seen & online status"
            checked={privacy.lastSeen ?? true}
            onChange={(checked) => setPrivacy({ lastSeen: checked })}
          />
        </PreferenceOptionCard>

        <PreferenceOptionCard
          label="Typing indicator"
          description="Let others see when you're typing a reply."
        >
          <PreferenceSwitch
            label="Typing indicator"
            checked={privacy.typingIndicator ?? true}
            onChange={(checked) => setPrivacy({ typingIndicator: checked })}
          />
        </PreferenceOptionCard>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Profile visibility in chat
      </h3>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <PreferenceOptionCard
          label="Profile photo"
          description="Show your profile photo to the people you message."
        >
          <PreferenceSwitch
            label="Profile photo"
            checked={privacy.profilePhotoVisibleInChat ?? true}
            onChange={(checked) =>
              setPrivacy({ profilePhotoVisibleInChat: checked })
            }
          />
        </PreferenceOptionCard>

        <PreferenceOptionCard
          label="About"
          description="Show your bio to the people you message."
        >
          <PreferenceSwitch
            label="About"
            checked={privacy.aboutVisibleInChat ?? true}
            onChange={(checked) => setPrivacy({ aboutVisibleInChat: checked })}
          />
        </PreferenceOptionCard>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Link previews
      </h3>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <PreferenceOptionCard
          label="Show link previews"
          description="Show a preview card for supported links (YouTube, X, Vimeo) you share in messages. Fetching a preview reveals the linked page to that site, so this is off by default."
        >
          <PreferenceSwitch
            label="Show link previews"
            checked={privacy.linkPreviewsEnabled ?? false}
            onChange={(checked) => setPrivacy({ linkPreviewsEnabled: checked })}
          />
        </PreferenceOptionCard>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-primary">
        Blocked accounts
      </h3>
      <div className="mb-8 grid grid-cols-1 gap-3">
        <PreferenceOptionCard
          label="Blocked accounts"
          description="Manage accounts you've blocked. They can't message you or see your content, and you won't see theirs."
        >
          <Link
            to={CLIENT_ROUTES.SETTINGS_BLOCKED_ACCOUNTS}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Manage
          </Link>
        </PreferenceOptionCard>
      </div>
    </div>
  );
};

export default PrivacyTab;
