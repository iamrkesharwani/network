import {
  PERSISTED_UPLOAD_POINTER_TTL_MS,
  UPLOAD_ACTIVE_SESSION_STORAGE_KEY_PREFIX,
  type IPersistedUploadPointer,
  type MultipartMediaType,
} from '@network/shared';

const storageKeyFor = (mediaType: MultipartMediaType) =>
  `${UPLOAD_ACTIVE_SESSION_STORAGE_KEY_PREFIX}${mediaType}`;

export const saveUploadPointer = (
  pointer: Omit<IPersistedUploadPointer, 'savedAt'>
): void => {
  try {
    const withTimestamp: IPersistedUploadPointer = {
      ...pointer,
      savedAt: Date.now(),
    };
    localStorage.setItem(
      storageKeyFor(pointer.mediaType),
      JSON.stringify(withTimestamp)
    );
  } catch {}
};

export const loadUploadPointer = (
  mediaType: MultipartMediaType
): IPersistedUploadPointer | null => {
  try {
    const raw = localStorage.getItem(storageKeyFor(mediaType));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as IPersistedUploadPointer;
    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > PERSISTED_UPLOAD_POINTER_TTL_MS
    ) {
      clearUploadPointer(mediaType);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearUploadPointer = (mediaType: MultipartMediaType): void => {
  try {
    localStorage.removeItem(storageKeyFor(mediaType));
  } catch {}
};
