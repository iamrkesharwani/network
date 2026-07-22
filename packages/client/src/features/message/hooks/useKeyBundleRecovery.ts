import { unwrapPrivateKey, type IWrappedPrivateKey } from '../keyManager';
import { setCachedKeyBundle } from '../localKeyStore';
import { useGetMyKeyBundleQuery } from '../keyBundleApi';

export const useKeyBundleRecovery = (
  userId: string,
  enabled: boolean,
  localWrapped?: IWrappedPrivateKey | null
) => {
  const { data, isFetching, isError } = useGetMyKeyBundleQuery(undefined, {
    skip: !enabled || Boolean(localWrapped),
  });

  const recoverKey = async (passphrase: string): Promise<CryptoKey> => {
    const wrapped: IWrappedPrivateKey | undefined =
      localWrapped ??
      (data && {
        wrappedPrivateKey: data.data.wrappedPrivateKey,
        wrapIv: data.data.wrapIv,
        wrapSalt: data.data.wrapSalt,
        pbkdf2Iterations: data.data.pbkdf2Iterations,
      });

    if (!wrapped) {
      throw new Error('No messaging key found for this account.');
    }

    const privateKey = await unwrapPrivateKey(wrapped, passphrase);
    await setCachedKeyBundle(userId, wrapped);

    return privateKey;
  };

  return {
    hasServerKeyBundle: Boolean(localWrapped) || Boolean(data),
    isFetching: localWrapped ? false : isFetching,
    isError,
    recoverKey,
  };
};
