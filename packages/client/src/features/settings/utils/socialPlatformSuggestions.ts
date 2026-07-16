import type { ComponentType } from 'react';
import { Link2 } from 'lucide-react';
import { SOCIAL_PLATFORMS, KNOWN_SOCIAL_PLATFORMS, type SocialPlatform } from '@network/shared';
import { socialPlatformMeta } from './socialPlatformMeta';
import { KNOWN_SOCIAL_PLATFORM_ICONS } from './knownSocialPlatformIcons';

export interface SocialPlatformSuggestion {
  label: string;
  icon: ComponentType<{ className?: string }>;
  platform: SocialPlatform;
  customLabel?: string;
}

const PRIMARY_SUGGESTIONS: SocialPlatformSuggestion[] = SOCIAL_PLATFORMS.filter(
  (platform) => platform !== 'other'
).map((platform) => ({
  label: socialPlatformMeta[platform].label,
  icon: socialPlatformMeta[platform].icon,
  platform,
}));

const KNOWN_SUGGESTIONS: SocialPlatformSuggestion[] = KNOWN_SOCIAL_PLATFORMS.map((known) => ({
  label: known.name,
  icon: KNOWN_SOCIAL_PLATFORM_ICONS[known.key] ?? Link2,
  platform: 'other' as const,
  customLabel: known.name,
}));

export const SOCIAL_PLATFORM_SUGGESTIONS: SocialPlatformSuggestion[] = [
  ...PRIMARY_SUGGESTIONS,
  ...KNOWN_SUGGESTIONS,
];

export const matchSocialPlatformSuggestions = (query: string): SocialPlatformSuggestion[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const startsWithQuery = SOCIAL_PLATFORM_SUGGESTIONS.filter((suggestion) =>
    suggestion.label.toLowerCase().startsWith(normalized)
  );
  const containsQuery = SOCIAL_PLATFORM_SUGGESTIONS.filter(
    (suggestion) =>
      !suggestion.label.toLowerCase().startsWith(normalized) &&
      suggestion.label.toLowerCase().includes(normalized)
  );

  return [...startsWithQuery, ...containsQuery].slice(0, 8);
};

export const findExactSocialPlatformSuggestion = (
  label: string
): SocialPlatformSuggestion | undefined => {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return undefined;
  return SOCIAL_PLATFORM_SUGGESTIONS.find(
    (suggestion) => suggestion.label.toLowerCase() === normalized
  );
};
