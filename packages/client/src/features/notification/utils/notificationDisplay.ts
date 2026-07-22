import { CLIENT_ROUTES, type INotificationListItem } from '@network/shared';
import { buildProfilePath } from '../../profile/utils/buildProfilePath';

const SOCIAL_VERB_BY_TYPE: Partial<Record<string, string>> = {
  follow: 'started following you',
  like: 'liked your post',
  comment: 'commented on your post',
  comment_reply: 'replied to your comment',
  mention: 'mentioned you',
};

const SYSTEM_MESSAGE_BY_TYPE: Partial<Record<string, string>> = {
  jury_case_assigned: 'You have been assigned a jury case to review.',
  content_removed: 'Your content was removed after a jury review.',
  report_resolved: 'Your report was upheld — the content was actioned.',
  report_dismissed: 'Your report was reviewed and dismissed.',
  appeal_upheld: 'Your appeal was reviewed and the removal was upheld.',
  appeal_overturned: 'Your appeal was upheld — your content is active again.',
};

export const getNotificationMessage = (
  item: INotificationListItem
): string => {
  const socialVerb = SOCIAL_VERB_BY_TYPE[item.type];
  if (socialVerb) {
    const first = item.actors[0]?.name ?? 'Someone';
    const others = item.actorCount - 1;
    const actorPhrase =
      others > 0 ? `${first} and ${others} other${others > 1 ? 's' : ''}` : first;
    return `${actorPhrase} ${socialVerb}`;
  }

  return SYSTEM_MESSAGE_BY_TYPE[item.type] ?? 'You have a new notification.';
};

const CONTENT_WATCH_ROUTE: Partial<Record<string, string>> = {
  post: CLIENT_ROUTES.POST_WATCH.replace(':postId', ''),
  short: CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', ''),
  video: CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', ''),
};

export const getNotificationPath = (
  item: INotificationListItem
): string | null => {
  if (item.type === 'follow') {
    return item.actors[0] ? buildProfilePath(item.actors[0].username) : null;
  }

  if (item.type === 'jury_case_assigned' && item.targetId) {
    return CLIENT_ROUTES.JURY_CASE.replace(':caseId', item.targetId);
  }

  if (item.type === 'appeal_upheld' || item.type === 'appeal_overturned') {
    return CLIENT_ROUTES.JURY_APPEALS;
  }

  const contentRoute = CONTENT_WATCH_ROUTE[item.targetType];
  if (contentRoute && item.targetId) {
    return `${contentRoute}${item.targetId}`;
  }

  return null;
};
