import {
  PROFILE_VIEW_MODE_STORAGE_KEY,
  type ProfileContentType,
  type ViewMode,
} from '@network/shared';
import { useIsMobileLayout } from '../../../shared/hooks/useIsMobileLayout';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useDeviceSyncedPreference } from '../../user/hooks/useDeviceSyncedPreference';

export const useProfileViewMode = (
  contentType: ProfileContentType
): [ViewMode, (mode: ViewMode) => void] => {
  const isMobile = useIsMobileLayout();
  const dbValue = useAppSelector(
    (state) => state.auth.user?.preferences?.profileViewMode?.[contentType]
  );

  const [viewMode, setViewMode] = useDeviceSyncedPreference<ViewMode>({
    storageKey: `${PROFILE_VIEW_MODE_STORAGE_KEY}:${contentType}`,
    defaultValue: 'grid',
    dbValue,
    toPatch: (mode) => ({ profileViewMode: { [contentType]: mode } }),
  });

  return [isMobile ? viewMode : 'grid', setViewMode];
};
