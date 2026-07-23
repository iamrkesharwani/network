import { useEffect, useState } from 'react';
import type { IMessageKeyRing } from '../keyManager';
import { getCachedHistoricalKeyRing } from '../localKeyStore';

export const useMessageKeyRing = (
  userId: string | undefined,
  activeKeyVersion: number | undefined
): IMessageKeyRing | undefined => {
  const [keyRing, setKeyRing] = useState<IMessageKeyRing | undefined>(
    undefined
  );

  useEffect(() => {
    if (!userId || activeKeyVersion === undefined) {
      setKeyRing(undefined);
      return;
    }

    let cancelled = false;
    getCachedHistoricalKeyRing(userId).then((historicalKeys) => {
      if (!cancelled) setKeyRing({ activeKeyVersion, historicalKeys });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, activeKeyVersion]);

  return keyRing;
};
