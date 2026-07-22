import { openDB, type IDBPDatabase } from 'idb';
import {
  MESSAGE_KEY_STORE_DB_NAME,
  MESSAGE_KEY_STORE_DB_VERSION,
  MESSAGE_KEY_STORE_NAME,
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
      },
    });
  }
  return dbPromise;
};

export const getCachedKeyBundle = async (
  userId: string
): Promise<IWrappedPrivateKey | null> => {
  const db = await getDb();
  const record = await db.get(MESSAGE_KEY_STORE_NAME, userId);
  return record ?? null;
};

export const setCachedKeyBundle = async (
  userId: string,
  wrapped: IWrappedPrivateKey
): Promise<void> => {
  const db = await getDb();
  await db.put(MESSAGE_KEY_STORE_NAME, wrapped, userId);
};

export const clearCachedKeyBundle = async (userId: string): Promise<void> => {
  const db = await getDb();
  await db.delete(MESSAGE_KEY_STORE_NAME, userId);
};
