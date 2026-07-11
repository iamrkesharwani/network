import { useState } from 'react';
import { PROFILE_VIEW_MODE_STORAGE_KEY, type ViewMode } from '@network/shared';

type ContentType = 'video' | 'short' | 'post';
type ViewModeMap = Partial<Record<ContentType, ViewMode>>;

const readStoredMap = (): ViewModeMap => {
  try {
    const raw = localStorage.getItem(PROFILE_VIEW_MODE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ViewModeMap) : {};
  } catch {
    return {};
  }
};

export const useProfileViewMode = (
  contentType: ContentType
): [ViewMode, (mode: ViewMode) => void] => {
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => readStoredMap()[contentType] ?? 'grid'
  );

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    const map = readStoredMap();
    map[contentType] = mode;
    localStorage.setItem(PROFILE_VIEW_MODE_STORAGE_KEY, JSON.stringify(map));
  };

  return [viewMode, updateViewMode];
};
