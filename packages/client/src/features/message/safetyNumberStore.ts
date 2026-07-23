import { MESSAGE_SAFETY_NUMBER_STORAGE_KEY_PREFIX } from '@network/shared';

interface SafetyNumberRecord {
  verifiedFingerprint: string;
  verifiedAt: number;
}

export type ContactVerificationStatus = 'unverified' | 'verified' | 'key-changed';

const storageKey = (myUserId: string, contactUserId: string): string =>
  `${MESSAGE_SAFETY_NUMBER_STORAGE_KEY_PREFIX}${myUserId}:${contactUserId}`;

const readRecord = (
  myUserId: string,
  contactUserId: string
): SafetyNumberRecord | null => {
  const raw = localStorage.getItem(storageKey(myUserId, contactUserId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SafetyNumberRecord;
  } catch {
    return null;
  }
};

export const markContactVerified = (
  myUserId: string,
  contactUserId: string,
  fingerprint: string
): void => {
  localStorage.setItem(
    storageKey(myUserId, contactUserId),
    JSON.stringify({ verifiedFingerprint: fingerprint, verifiedAt: Date.now() })
  );
};

export const clearContactVerification = (
  myUserId: string,
  contactUserId: string
): void => {
  localStorage.removeItem(storageKey(myUserId, contactUserId));
};

export const getContactVerificationStatus = (
  myUserId: string,
  contactUserId: string,
  currentFingerprint: string
): ContactVerificationStatus => {
  const record = readRecord(myUserId, contactUserId);
  if (!record) return 'unverified';
  return record.verifiedFingerprint === currentFingerprint
    ? 'verified'
    : 'key-changed';
};
