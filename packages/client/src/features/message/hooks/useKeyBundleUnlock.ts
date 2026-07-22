import type { IKeyBundleOwnResponse } from '@network/shared';
import { unwrapPrivateKey } from '../keyManager';
import { setCachedPrivateKey } from '../localKeyStore';
import { useConfirmKeyRecoveryMutation } from '../keyBundleApi';

export const useKeyBundleUnlock = (userId: string) => {
  const [confirmRecovery, { isLoading: isRecovering }] =
    useConfirmKeyRecoveryMutation();

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
