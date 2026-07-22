import { extractMentionedUsernames, type NotificationTargetType } from '@network/shared';
import * as userRepository from '../user/user.repository.js';
import { queueNotification } from './notification.queue.js';

interface MentionTarget {
  actorId: string;
  targetType: NotificationTargetType;
  targetId: string;
}

const queueMentionsFor = async (
  usernames: string[],
  target: MentionTarget,
  excludeUserIds: Set<string>
): Promise<void> => {
  if (usernames.length === 0) return;

  const users = await userRepository.findActiveByUsernames(usernames);

  for (const user of users) {
    const recipientId = user._id.toString();
    if (recipientId === target.actorId) continue;
    if (excludeUserIds.has(recipientId)) continue;

    await queueNotification({
      type: 'mention',
      recipientId,
      actorId: target.actorId,
      targetType: target.targetType,
      targetId: target.targetId,
    });
  }
};

export const queueMentionNotifications = async (
  text: string,
  target: MentionTarget,
  excludeUserIds: Set<string> = new Set()
): Promise<void> =>
  queueMentionsFor(extractMentionedUsernames(text), target, excludeUserIds);

export const queueMentionDiffNotifications = async (
  oldText: string,
  newText: string,
  target: MentionTarget
): Promise<void> => {
  const oldUsernames = new Set(extractMentionedUsernames(oldText));
  const newlyMentioned = extractMentionedUsernames(newText).filter(
    (username) => !oldUsernames.has(username)
  );

  await queueMentionsFor(newlyMentioned, target, new Set());
};
