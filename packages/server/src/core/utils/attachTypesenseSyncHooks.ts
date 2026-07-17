import type { Schema } from 'mongoose';
import { Errors } from 'typesense';
import { typesenseClient } from '../config/typesense.js';
import { logger } from './logger.js';

interface TypesenseSyncOptions<TDoc> {
  collection: string;
  toDocument: (doc: TDoc) => Record<string, unknown>;
  isIndexable?: (doc: TDoc) => boolean;
}

const upsert = async (
  collection: string,
  document: Record<string, unknown>
): Promise<void> => {
  try {
    await typesenseClient.collections(collection).documents().upsert(document);
  } catch (error) {
    logger.error(
      error,
      `Failed to sync document into Typesense collection "${collection}"`
    );
  }
};

const remove = async (collection: string, id: string): Promise<void> => {
  try {
    await typesenseClient.collections(collection).documents(id).delete();
  } catch (error) {
    if (error instanceof Errors.ObjectNotFound) return;
    logger.error(
      error,
      `Failed to remove document from Typesense collection "${collection}"`
    );
  }
};

export const attachTypesenseSyncHooks = <
  TDoc extends { _id: { toString(): string } },
>(
  schema: Schema<TDoc>,
  options: TypesenseSyncOptions<TDoc>
): void => {
  const { collection, toDocument, isIndexable } = options;

  const syncDoc = (doc: TDoc): void => {
    const id = doc._id.toString();
    if (isIndexable && !isIndexable(doc)) {
      void remove(collection, id);
      return;
    }
    void upsert(collection, { id, ...toDocument(doc) });
  };

  schema.post('save', function (doc: TDoc) {
    syncDoc(doc);
  });

  schema.post('findOneAndUpdate', function (doc: TDoc | null) {
    if (doc) syncDoc(doc);
  });

  schema.post('findOneAndDelete', function (doc: TDoc | null) {
    if (doc) void remove(collection, doc._id.toString());
  });
};
