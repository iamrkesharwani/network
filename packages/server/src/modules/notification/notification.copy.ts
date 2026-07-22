import type { INotificationListItem, NotificationType } from '@network/shared';

const SOCIAL_VERB_BY_TYPE: Record<string, string> = {
  follow: 'started following you',
  like: 'liked your post',
  comment: 'commented on your post',
  comment_reply: 'replied to your comment',
  mention: 'mentioned you',
};

const SYSTEM_MESSAGE_BY_TYPE: Record<string, string> = {
  jury_case_assigned: 'You have been assigned a jury case to review.',
  content_removed: 'Your content was removed after a jury review.',
  report_resolved: 'Your report was upheld — the content was actioned.',
  report_dismissed: 'Your report was reviewed and dismissed.',
  appeal_upheld: 'Your appeal was reviewed and the removal was upheld.',
  appeal_overturned: 'Your appeal was upheld — your content is active again.',
};

const isSocialType = (type: NotificationType): boolean =>
  type in SOCIAL_VERB_BY_TYPE;

const actorPhrase = (item: INotificationListItem): string => {
  const first = item.actors[0]?.name ?? 'Someone';
  const others = item.actorCount - 1;
  if (others <= 0) return first;
  return `${first} and ${others} other${others > 1 ? 's' : ''}`;
};

export const buildNotificationCopy = (
  item: INotificationListItem
): { title: string; body: string } => {
  if (isSocialType(item.type)) {
    return {
      title: actorPhrase(item),
      body: SOCIAL_VERB_BY_TYPE[item.type] as string,
    };
  }

  return {
    title: 'Network',
    body: SYSTEM_MESSAGE_BY_TYPE[item.type] as string,
  };
};
