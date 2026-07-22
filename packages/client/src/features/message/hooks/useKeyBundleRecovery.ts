import { unwrapPrivateKey, type IWrappedPrivateKey } from '../keyManager';
import { setCachedKeyBundle } from '../localKeyStore';
import { useGetMyKeyBundleQuery } from '../keyBundleApi';

export const useKeyBundleRecovery = (userId: string, enabled: boolean) => {
  const { data, isFetching, isError } = useGetMyKeyBundleQuery(undefined, {
    skip: !enabled,
  });

  const recoverKey = async (passphrase: string): Promise<CryptoKey> => {
    if (!data) {
      throw new Error('No messaging key found for this account.');
    }

    const wrapped: IWrappedPrivateKey = {
      wrappedPrivateKey: data.data.wrappedPrivateKey,
      wrapIv: data.data.wrapIv,
      wrapSalt: data.data.wrapSalt,
      pbkdf2Iterations: data.data.pbkdf2Iterations,
    };

    const privateKey = await unwrapPrivateKey(wrapped, passphrase);
    await setCachedKeyBundle(userId, wrapped);

    return privateKey;
  };

  return {
    hasServerKeyBundle: Boolean(data),
    isFetching,
    isError,
    recoverKey,
  };
};
