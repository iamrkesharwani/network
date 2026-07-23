import type { IKeyBundleOwnResponse } from '@network/shared';
import {
  generateKeyPair,
  exportPublicKey,
  unwrapPrivateKey,
  wrapPrivateKey,
  generateRecoveryToken,
} from '../keyManager';
import {
  setCachedPrivateKey,
  setCachedHistoricalPrivateKey,
} from '../localKeyStore';
import {
  useRotateKeyBundleMutation,
  useLazyGetMyKeyBundleQuery,
} from '../keyBundleApi';

export const useKeyBundleRotation = (userId: string) => {
  const [rotateKeyBundle, { isLoading }] = useRotateKeyBundleMutation();
  const [fetchKeyBundle] = useLazyGetMyKeyBundleQuery();

  const rotateKey = async (
    currentPrivateKey: CryptoKey,
    passphrase: string
  ): Promise<CryptoKey> => {
    const currentKeyBundle: IKeyBundleOwnResponse = (
      await fetchKeyBundle().unwrap()
    ).data;

    // Wrapping never fails even with a wrong secret - unwrapping is how we
    // actually know the passphrase is correct. Verify it against the
    // current key *before* trusting it to wrap the new one, or a typo here
    // would silently bake a wrong secret into the only copy of the new key.
    await unwrapPrivateKey(
      {
        wrappedPrivateKey: currentKeyBundle.wrappedPrivateKey,
        wrapIv: currentKeyBundle.wrapIv,
        wrapSalt: currentKeyBundle.wrapSalt,
        pbkdf2Iterations: currentKeyBundle.pbkdf2Iterations,
      },
      passphrase
    );

    // The retiring key is still fully unwrapped in memory right now - this
    // is the one moment we can cache it into history without needing any
    // wrap secret at all, since it's already plaintext-in-hand.
    await setCachedHistoricalPrivateKey(
      userId,
      currentKeyBundle.keyVersion,
      currentPrivateKey
    );

    const { publicKey, privateKey } = await generateKeyPair();
    const exportedPublicKey = await exportPublicKey(publicKey);
    const wrapped = await wrapPrivateKey(privateKey, passphrase);
    const recoveryToken = generateRecoveryToken();
    const recoveryWrapped = await wrapPrivateKey(privateKey, recoveryToken);

    await rotateKeyBundle({
      publicKey: exportedPublicKey,
      wrappedPrivateKey: wrapped.wrappedPrivateKey,
      wrapIv: wrapped.wrapIv,
      wrapSalt: wrapped.wrapSalt,
      pbkdf2Iterations: wrapped.pbkdf2Iterations,
      recoveryWrappedPrivateKey: recoveryWrapped.wrappedPrivateKey,
      recoveryWrapIv: recoveryWrapped.wrapIv,
      recoveryWrapSalt: recoveryWrapped.wrapSalt,
      recoveryPbkdf2Iterations: recoveryWrapped.pbkdf2Iterations,
      recoveryToken,
    }).unwrap();

    await setCachedPrivateKey(userId, privateKey);

    return privateKey;
  };

  return { rotateKey, isLoading };
};
