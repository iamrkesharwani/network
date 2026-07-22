import {
  USERNAME_CHARSET_PATTERN,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from '../modules/user/constants/user.constants.js';
import { MENTION_MAX_PER_TEXT } from '../modules/notification/notification.constants.js';

export const extractMentionedUsernames = (text: string): string[] => {
  const pattern = new RegExp(
    `@(${USERNAME_CHARSET_PATTERN}{${USERNAME_MIN_LENGTH},${USERNAME_MAX_LENGTH}})`,
    'gi'
  );
  const usernames = new Set<string>();

  for (const match of text.matchAll(pattern)) {
    const username = match[1]?.toLowerCase();
    if (!username) continue;
    usernames.add(username);
    if (usernames.size >= MENTION_MAX_PER_TEXT) break;
  }

  return [...usernames];
};
