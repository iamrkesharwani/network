import {
  generateKeyPair,
  exportPublicKey,
  wrapPrivateKey,
} from '../keyManager';
import { setCachedKeyBundle } from '../localKeyStore';
import { usePublishKeyBundleMutation } from '../keyBundleApi';

export const useKeyBundleSetup = (userId: string) => {
  const [publishKeyBundle, { isLoading }] = usePublishKeyBundleMutation();

  const setupNewKey = async (passphrase: string): Promise<CryptoKey> => {
    const { publicKey, privateKey } = await generateKeyPair();
    const exportedPublicKey = await exportPublicKey(publicKey);
    const wrapped = await wrapPrivateKey(privateKey, passphrase);

    await publishKeyBundle({
      publicKey: exportedPublicKey,
      wrappedPrivateKey: wrapped.wrappedPrivateKey,
      wrapIv: wrapped.wrapIv,
      wrapSalt: wrapped.wrapSalt,
      pbkdf2Iterations: wrapped.pbkdf2Iterations,
    }).unwrap();

    await setCachedKeyBundle(userId, wrapped);

    return privateKey;
  };

  return { setupNewKey, isLoading };
};
