import type { VideoCategory } from '@network/shared';
import {
  Clapperboard,
  Cpu,
  Gamepad2,
  GraduationCap,
  Laugh,
  Music,
  Newspaper,
  Plane,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export const CategoryMeta: Record<
  VideoCategory,
  { label: string; icon: LucideIcon }
> = {
  EDUCATION: { label: 'Education', icon: GraduationCap },
  ENTERTAINMENT: { label: 'Entertainment', icon: Clapperboard },
  GAMING: { label: 'Gaming', icon: Gamepad2 },
  MUSIC: { label: 'Music', icon: Music },
  NEWS: { label: 'News', icon: Newspaper },
  SPORTS: { label: 'Sports', icon: Trophy },
  TECHNOLOGY: { label: 'Technology', icon: Cpu },
  TRAVEL: { label: 'Travel', icon: Plane },
  COMEDY: { label: 'Comedy', icon: Laugh },
  OTHER: { label: 'Other', icon: Sparkles },
};
