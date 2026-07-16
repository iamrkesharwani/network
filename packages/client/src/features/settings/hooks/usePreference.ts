import { useCallback } from 'react';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import {
  setPreferenceSection,
  type PreferencesState,
  type SetPreferenceSectionAction,
} from '../preferencesSlice';

type PreferenceSection = SetPreferenceSectionAction['section'];

export function usePreference<S extends PreferenceSection>(
  section: S
): [PreferencesState[S], (patch: Partial<PreferencesState[S]>) => void] {
  const value = useAppSelector((state) => state.preferences[section]);
  const dispatch = useAppDispatch();

  const setValue = useCallback(
    (patch: Partial<PreferencesState[S]>) => {
      dispatch(
        setPreferenceSection({
          section,
          patch,
        } as SetPreferenceSectionAction)
      );
    },
    [dispatch, section]
  );

  return [value, setValue];
}
