import type { MessagePinLength } from '@network/shared';
import { wrapPrivateKey, unwrapPrivateKey } from '../keyManager';
import {
  setCachedPinWrappedKey,
  getCachedPinWrappedKey,
  setCachedPrivateKey,
} from '../localKeyStore';
import { setPinConfig, recordPinEntry } from '../pinLockStore';

export const useMessagingPinLock = (userId: string) => {
  const setupPin = async (
    privateKey: CryptoKey,
    pin: string,
    length: MessagePinLength
  ): Promise<void> => {
    const wrapped = await wrapPrivateKey(privateKey, pin);
    await setCachedPinWrappedKey(userId, wrapped);
    // Also cache the raw key for the 7-day reentry window (see
    // isPinReentryDue) so a plain refresh doesn't re-prompt for the PIN.
    await setCachedPrivateKey(userId, privateKey);
    setPinConfig(userId, length);
    recordPinEntry(userId);
  };

  const unlockWithPin = async (pin: string): Promise<CryptoKey> => {
    const wrapped = await getCachedPinWrappedKey(userId);
    if (!wrapped) {
      throw new Error('No PIN-locked messaging key found on this device.');
    }
    const privateKey = await unwrapPrivateKey(wrapped, pin);
    await setCachedPrivateKey(userId, privateKey);
    recordPinEntry(userId);
    return privateKey;
  };

  return { setupPin, unlockWithPin };
};
