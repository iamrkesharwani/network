import type { ProfileTab } from '@network/shared';
import {
  Video,
  Film,
  FileText,
  BarChart3,
  History,
  Gavel,
  Settings,
} from 'lucide-react';

export interface ProfileTabDef {
  id: ProfileTab;
  label: string;
  icon: typeof Video;
  ownerOnly: boolean;
}

export const PROFILE_TABS: ProfileTabDef[] = [
  { id: 'videos', label: 'Videos', icon: Video, ownerOnly: false },
  { id: 'shorts', label: 'Shorts', icon: Film, ownerOnly: false },
  { id: 'posts', label: 'Posts', icon: FileText, ownerOnly: false },
  { id: 'stats', label: 'Stats', icon: BarChart3, ownerOnly: true },
  { id: 'history', label: 'History', icon: History, ownerOnly: true },
  { id: 'jury', label: 'Jury', icon: Gavel, ownerOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, ownerOnly: true },
];

export const getActiveProfileTab = (pathname: string): ProfileTab | null => {
  if (pathname.endsWith('/shorts')) return 'shorts';
  if (pathname.endsWith('/posts')) return 'posts';
  if (pathname.endsWith('/stats')) return 'stats';
  if (pathname.endsWith('/history')) return 'history';
  if (pathname.endsWith('/videos')) return 'videos';
  return null;
};
