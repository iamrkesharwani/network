import { Client, Errors } from 'typesense';
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js';
import { TYPESENSE_COLLECTIONS } from '@network/shared';
import { env } from '../env/env.js';
import { logger } from '../utils/logger.js';

export const typesenseClient = new Client({
  nodes: [
    {
      host: env.TYPESENSE_HOST,
      port: env.TYPESENSE_PORT,
      protocol: env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2,
});

const collectionSchemas: CollectionCreateSchema[] = [
  {
    name: TYPESENSE_COLLECTIONS.USER,
    fields: [
      { name: 'username', type: 'string' },
      { name: 'name', type: 'string' },
    ],
  },
  {
    name: TYPESENSE_COLLECTIONS.VIDEO,
    fields: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string', optional: true },
      { name: 'tags', type: 'string[]', optional: true },
    ],
  },
  {
    name: TYPESENSE_COLLECTIONS.SHORT,
    fields: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string', optional: true },
      { name: 'tags', type: 'string[]', optional: true },
    ],
  },
  {
    name: TYPESENSE_COLLECTIONS.POST,
    fields: [
      { name: 'text', type: 'string', optional: true },
      { name: 'tags', type: 'string[]', optional: true },
    ],
  },
];

export const initTypesense = async (): Promise<void> => {
  for (const schema of collectionSchemas) {
    try {
      await typesenseClient.collections(schema.name).retrieve();
    } catch (error) {
      if (!(error instanceof Errors.ObjectNotFound)) throw error;
      await typesenseClient.collections().create(schema);
      logger.info(`Created Typesense collection: ${schema.name}`);
    }
  }
};
