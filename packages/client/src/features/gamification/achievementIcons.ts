import {
  Rocket,
  Flame,
  Trophy,
  Tag,
  Sparkles,
  Feather,
  Image,
  Moon,
  Award,
  type LucideIcon,
} from 'lucide-react';

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  flame: Flame,
  trophy: Trophy,
  tag: Tag,
  sparkles: Sparkles,
  feather: Feather,
  image: Image,
  moon: Moon,
};

export const getAchievementIcon = (icon: string): LucideIcon =>
  ACHIEVEMENT_ICONS[icon] ?? Award;
