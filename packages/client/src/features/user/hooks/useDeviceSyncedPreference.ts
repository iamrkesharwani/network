import { useEffect, useState } from 'react';
import type { UpdatePreferencesInput } from '@network/shared';
import { useAuth } from '../../auth/useAuth';
import { useUpdatePreferencesMutation } from '../userApi';

const readLocal = <T>(storageKey: string): T | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
};

interface UseDeviceSyncedPreferenceOptions<T> {
  storageKey: string;
  defaultValue: T;
  dbValue: T | undefined;
  toPatch: (value: T) => UpdatePreferencesInput;
}

export const useDeviceSyncedPreference = <T>({
  storageKey,
  defaultValue,
  dbValue,
  toPatch,
}: UseDeviceSyncedPreferenceOptions<T>): [T, (value: T) => void] => {
  const { isAuthenticated } = useAuth();
  const [updatePreferences] = useUpdatePreferencesMutation();
  const [value, setValueState] = useState<T>(
    () => readLocal<T>(storageKey) ?? defaultValue
  );

  useEffect(() => {
    if (dbValue === undefined) return;
    setValueState((current) => {
      if (JSON.stringify(current) === JSON.stringify(dbValue)) return current;
      localStorage.setItem(storageKey, JSON.stringify(dbValue));
      return dbValue;
    });
  }, [dbValue, storageKey]);

  const setValue = (next: T) => {
    localStorage.setItem(storageKey, JSON.stringify(next));
    setValueState(next);

    if (!isAuthenticated) return;
    updatePreferences(toPatch(next));
  };

  return [value, setValue];
};
