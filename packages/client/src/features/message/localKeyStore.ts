import { openDB, type IDBPDatabase } from 'idb';
import {
  MESSAGE_KEY_STORE_DB_NAME,
  MESSAGE_KEY_STORE_DB_VERSION,
  MESSAGE_KEY_STORE_NAME,
  MESSAGE_PIN_KEY_STORE_NAME,
  MESSAGE_HISTORICAL_KEY_STORE_NAME,
} from '@network/shared';
import type { IWrappedPrivateKey } from './keyManager';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(MESSAGE_KEY_STORE_DB_NAME, MESSAGE_KEY_STORE_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(MESSAGE_KEY_STORE_NAME)) {
          db.createObjectStore(MESSAGE_KEY_STORE_NAME);
        }
        if (!db.objectStoreNames.contains(MESSAGE_PIN_KEY_STORE_NAME)) {
          db.createObjectStore(MESSAGE_PIN_KEY_STORE_NAME);
        }
        if (!db.objectStoreNames.contains(MESSAGE_HISTORICAL_KEY_STORE_NAME)) {
          db.createObjectStore(MESSAGE_HISTORICAL_KEY_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

const historicalKeyId = (userId: string, keyVersion: number): string =>
  `${userId}:${keyVersion}`;

export const getCachedPrivateKey = async (
  userId: string
): Promise<CryptoKey | null> => {
  const db = await getDb();
  const record = await db.get(MESSAGE_KEY_STORE_NAME, userId);
  return record ?? null;
};

export const setCachedPrivateKey = async (
  userId: string,
  privateKey: CryptoKey
): Promise<void> => {
  const db = await getDb();
  await db.put(MESSAGE_KEY_STORE_NAME, privateKey, userId);
};

export const clearCachedPrivateKey = async (userId: string): Promise<void> => {
  const db = await getDb();
  await db.delete(MESSAGE_KEY_STORE_NAME, userId);
};

export const getCachedPinWrappedKey = async (
  userId: string
): Promise<IWrappedPrivateKey | null> => {
  const db = await getDb();
  const record = await db.get(MESSAGE_PIN_KEY_STORE_NAME, userId);
  return record ?? null;
};

export const setCachedPinWrappedKey = async (
  userId: string,
  wrapped: IWrappedPrivateKey
): Promise<void> => {
  const db = await getDb();
  await db.put(MESSAGE_PIN_KEY_STORE_NAME, wrapped, userId);
};

export const clearCachedPinWrappedKey = async (
  userId: string
): Promise<void> => {
  const db = await getDb();
  await db.delete(MESSAGE_PIN_KEY_STORE_NAME, userId);
};

export const setCachedHistoricalPrivateKey = async (
  userId: string,
  keyVersion: number,
  privateKey: CryptoKey
): Promise<void> => {
  const db = await getDb();
  await db.put(
    MESSAGE_HISTORICAL_KEY_STORE_NAME,
    privateKey,
    historicalKeyId(userId, keyVersion)
  );
};

const userHistoricalKeyIds = async (
  db: IDBPDatabase,
  userId: string
): Promise<string[]> => {
  const allKeys = await db.getAllKeys(MESSAGE_HISTORICAL_KEY_STORE_NAME);
  const prefix = `${userId}:`;
  return allKeys.filter(
    (key): key is string => typeof key === 'string' && key.startsWith(prefix)
  );
};

export const getCachedHistoricalKeyRing = async (
  userId: string
): Promise<Map<number, CryptoKey>> => {
  const db = await getDb();
  const ids = await userHistoricalKeyIds(db, userId);
  const ring = new Map<number, CryptoKey>();

  for (const id of ids) {
    const value = (await db.get(MESSAGE_HISTORICAL_KEY_STORE_NAME, id)) as
      | CryptoKey
      | undefined;
    if (!value) continue;
    const keyVersion = Number(id.slice(userId.length + 1));
    ring.set(keyVersion, value);
  }

  return ring;
};

export const clearCachedHistoricalPrivateKeys = async (
  userId: string
): Promise<void> => {
  const db = await getDb();
  const ids = await userHistoricalKeyIds(db, userId);
  const tx = db.transaction(MESSAGE_HISTORICAL_KEY_STORE_NAME, 'readwrite');
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
};
