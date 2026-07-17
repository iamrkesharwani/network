import type { ComponentType } from 'react';
import { Link2 } from 'lucide-react';
import { SOCIAL_PLATFORM_CATALOG } from '@network/shared';
import { SOCIAL_PLATFORM_ICONS } from './socialPlatformIcons';

export interface SocialPlatformSuggestion {
  label: string;
  icon: ComponentType<{ className?: string }>;
  isCustom?: boolean;
}

const CATALOG_SUGGESTIONS: SocialPlatformSuggestion[] = SOCIAL_PLATFORM_CATALOG.map(
  (entry) => ({
    label: entry.name,
    icon: SOCIAL_PLATFORM_ICONS[entry.key] ?? Link2,
  })
);

const editDistance = (a: string, b: string): number => {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i]![j] = Math.min(dp[i]![j]!, dp[i - 2]![j - 2]! + 1);
      }
    }
  }
  return dp[a.length]![b.length]!;
};

const typoTolerance = (queryLength: number): number => {
  if (queryLength <= 4) return 1;
  if (queryLength <= 8) return 2;
  return 3;
};

export const matchKnownSocialPlatforms = (
  query: string
): SocialPlatformSuggestion[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const scored = CATALOG_SUGGESTIONS.map((suggestion) => {
    const label = suggestion.label.toLowerCase();
    if (label === normalized) return { suggestion, score: 0 };
    if (label.startsWith(normalized)) return { suggestion, score: 1 };
    if (label.includes(normalized)) return { suggestion, score: 2 };

    const distance = editDistance(normalized, label);
    if (distance <= typoTolerance(normalized.length)) {
      return { suggestion, score: 3 + distance };
    }
    return null;
  }).filter(
    (entry): entry is { suggestion: SocialPlatformSuggestion; score: number } =>
      entry !== null
  );

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, 7).map((entry) => entry.suggestion);
};

export const findExactSocialPlatform = (
  label: string
): SocialPlatformSuggestion | undefined => {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return undefined;
  return CATALOG_SUGGESTIONS.find(
    (suggestion) => suggestion.label.toLowerCase() === normalized
  );
};
