import type { PreferencesNotificationCategory } from '@network/shared';
import { usePreference } from '../../hooks/usePreference';
import PreferenceSwitch from './PreferenceSwitch';

const CATEGORY_LABELS: Record<
  Exclude<PreferencesNotificationCategory, 'uploads'>,
  { label: string; description: string }
> = {
  likes: { label: 'Likes', description: 'When someone likes your content' },
  comments: {
    label: 'Comments',
    description: 'New comments and replies on your content',
  },
  follows: { label: 'Follows', description: 'When someone follows you' },
  mentions: {
    label: 'Mentions',
    description: 'When someone @mentions you',
  },
  moderation: {
    label: 'Moderation',
    description: 'Jury assignments and moderation actions on your content',
  },
  newsletter: {
    label: 'Newsletter',
    description: 'Product updates and announcements',
  },
  reports: {
    label: 'Reports',
    description: "Updates on reports you've filed",
  },
  appeals: {
    label: 'Appeals',
    description: "Updates on appeals you've filed",
  },
};

const CATEGORIES = Object.keys(
  CATEGORY_LABELS
) as (keyof typeof CATEGORY_LABELS)[];

const NotificationCategoryGrid = () => {
  const [notifications, setNotifications] = usePreference('notifications');

  const toggle = (
    channel: 'push' | 'email',
    category: PreferencesNotificationCategory,
    checked: boolean
  ) => {
    setNotifications({ [channel]: { [category]: checked } });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-border bg-surface-raised px-4 py-2.5">
        <span className="text-xs font-semibold text-text-secondary">
          Category
        </span>
        <span className="text-center text-xs font-semibold text-text-secondary">
          Push
        </span>
        <span className="text-center text-xs font-semibold text-text-secondary">
          Email
        </span>
      </div>

      {CATEGORIES.map((category) => {
        const { label, description } = CATEGORY_LABELS[category];
        const pushEnabled = notifications.push?.[category] ?? true;
        const emailEnabled = notifications.email?.[category] ?? false;

        return (
          <div
            key={category}
            className="grid grid-cols-[1fr_5rem_5rem] items-center gap-2 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-muted">{description}</p>
            </div>
            <div className="flex justify-center">
              <PreferenceSwitch
                label={`${label} push notifications`}
                checked={pushEnabled}
                onChange={(checked) => toggle('push', category, checked)}
              />
            </div>
            <div className="flex justify-center">
              <PreferenceSwitch
                label={`${label} email notifications`}
                checked={emailEnabled}
                onChange={(checked) => toggle('email', category, checked)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCategoryGrid;
