import {
  generateKeyPair,
  exportPublicKey,
  wrapPrivateKey,
  generateRecoveryToken,
} from '../keyManager';
import { setCachedPrivateKey } from '../localKeyStore';
import { usePublishKeyBundleMutation } from '../keyBundleApi';

export const useKeyBundleSetup = (userId: string) => {
  const [publishKeyBundle, { isLoading }] = usePublishKeyBundleMutation();

  const setupNewKey = async (passphrase: string): Promise<CryptoKey> => {
    const { publicKey, privateKey } = await generateKeyPair();
    const exportedPublicKey = await exportPublicKey(publicKey);
    const wrapped = await wrapPrivateKey(privateKey, passphrase);
    const recoveryToken = generateRecoveryToken();
    const recoveryWrapped = await wrapPrivateKey(privateKey, recoveryToken);

    await publishKeyBundle({
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

  return { setupNewKey, isLoading };
};
