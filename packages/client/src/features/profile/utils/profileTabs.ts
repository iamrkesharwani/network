import { Video, Film, FileText, BarChart3 } from 'lucide-react';

export type ProfileTab = 'videos' | 'shorts' | 'posts' | 'stats';

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
];

export const getActiveProfileTab = (pathname: string): ProfileTab | null => {
  if (pathname.endsWith('/shorts')) return 'shorts';
  if (pathname.endsWith('/posts')) return 'posts';
  if (pathname.endsWith('/stats')) return 'stats';
  if (pathname.endsWith('/videos')) return 'videos';
  return null;
};
