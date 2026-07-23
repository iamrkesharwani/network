import type { IKeyBundleOwnResponse } from '@network/shared';
import { unwrapPrivateKey } from '../keyManager';
import { setCachedPrivateKey, setCachedHistoricalPrivateKey } from '../localKeyStore';
import {
  useConfirmKeyRecoveryMutation,
  useLazyGetKeyHistoryQuery,
} from '../keyBundleApi';

export const useKeyBundleUnlock = (userId: string) => {
  const [confirmRecovery, { isLoading: isRecovering }] =
    useConfirmKeyRecoveryMutation();
  const [fetchKeyHistory] = useLazyGetKeyHistoryQuery();

  const unlockWithPassphrase = async (
    keyBundle: IKeyBundleOwnResponse,
    passphrase: string
  ): Promise<CryptoKey> => {
    const privateKey = await unwrapPrivateKey(
      {
        wrappedPrivateKey: keyBundle.wrappedPrivateKey,
        wrapIv: keyBundle.wrapIv,
        wrapSalt: keyBundle.wrapSalt,
        pbkdf2Iterations: keyBundle.pbkdf2Iterations,
      },
      passphrase
    );
    await setCachedPrivateKey(userId, privateKey);

    // Best-effort: retired keys are wrapped under this same passphrase (see
    // ChangePasswordSection's rewrap cascade), so this is the one moment we
    // can unwrap and cache all of them on this device. Not the end of the
    // world if it fails - just means history from before this device's last
    // sync stays unreadable here until the next passphrase unlock.
    try {
      const history = await fetchKeyHistory().unwrap();
      for (const entry of history.data) {
        const historicalKey = await unwrapPrivateKey(
          {
            wrappedPrivateKey: entry.wrappedPrivateKey,
            wrapIv: entry.wrapIv,
            wrapSalt: entry.wrapSalt,
            pbkdf2Iterations: entry.pbkdf2Iterations,
          },
          passphrase
        );
        await setCachedHistoricalPrivateKey(
          userId,
          entry.keyVersion,
          historicalKey
        );
      }
    } catch {
      // See comment above - non-fatal.
    }

    return privateKey;
  };

  const unlockWithRecoveryToken = async (
    recoveryToken: string
  ): Promise<CryptoKey> => {
    const result = await confirmRecovery({ recoveryToken }).unwrap();
    const privateKey = await unwrapPrivateKey(
      {
        wrappedPrivateKey: result.data.recoveryWrappedPrivateKey,
        wrapIv: result.data.recoveryWrapIv,
        wrapSalt: result.data.recoveryWrapSalt,
        pbkdf2Iterations: result.data.recoveryPbkdf2Iterations,
      },
      recoveryToken
    );
    await setCachedPrivateKey(userId, privateKey);
    return privateKey;
  };

  return { unlockWithPassphrase, unlockWithRecoveryToken, isRecovering };
};
