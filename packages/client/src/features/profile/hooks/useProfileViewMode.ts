import type { ProfileContentType, ViewMode } from '@network/shared';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { usePreference } from '../../settings/hooks/usePreference';

const DEFAULT_VIEW_MODE: ViewMode = 'grid';

export const useProfileViewMode = (
  contentType: ProfileContentType
): [ViewMode, (mode: ViewMode) => void] => {
  const isMobile = useIsMobileLayout();
  const [layout, setLayout] = usePreference('layout');
  const viewMode = layout.profileViewMode?.[contentType] ?? DEFAULT_VIEW_MODE;

  const setViewMode = (mode: ViewMode) => {
    setLayout({ profileViewMode: { [contentType]: mode } });
  };

  return [isMobile ? viewMode : DEFAULT_VIEW_MODE, setViewMode];
};
