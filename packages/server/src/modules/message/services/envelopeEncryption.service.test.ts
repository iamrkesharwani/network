import { describe, it, expect, vi } from 'vitest';
import { randomBytes } from 'node:crypto';

const DATA_KEY_BYTE_LENGTH = 32;

vi.mock('../../../core/providers/provider.js', () => {
  const dataKeysByEncryptedKey = new Map<string, Buffer>();

  return {
    kmsProvider: {
      generateDataKey: vi.fn(async () => {
        const plaintextKey = randomBytes(DATA_KEY_BYTE_LENGTH);
        const encryptedDataKey = randomBytes(DATA_KEY_BYTE_LENGTH).toString(
          'base64'
        );
        dataKeysByEncryptedKey.set(encryptedDataKey, Buffer.from(plaintextKey));
        return { plaintextKey, encryptedDataKey };
      }),
      decryptDataKey: vi.fn(async (encryptedDataKey: string) => {
        const plaintextKey = dataKeysByEncryptedKey.get(encryptedDataKey);
        if (!plaintextKey) {
          throw new Error('Unknown encrypted data key.');
        }
        return plaintextKey;
      }),
    },
  };
});

vi.mock('../../../core/config/redis.js', () => {
  const cache = new Map<string, string>();

  return {
    redisClient: {
      get: vi.fn(async (key: string) => cache.get(key) ?? null),
      set: vi.fn(async (key: string, value: string) => {
        cache.set(key, value);
        return 'OK';
      }),
    },
  };
});

import {
  encryptContent,
  decryptContent,
  encryptBuffer,
  decryptBuffer,
} from './envelopeEncryption.service.js';

describe('envelopeEncryption.service', () => {
  it('round-trips plaintext through encryptContent and decryptContent', async () => {
    const plaintext = 'the quick brown fox jumps over the lazy dog';

    const encrypted = await encryptContent(plaintext);
    const decrypted = await decryptContent(
      encrypted.ciphertext,
      encrypted.encryptedDataKey,
      encrypted.iv
    );

    expect(decrypted).toBe(plaintext);
  });

  it('never stores the plaintext as a substring of the ciphertext', async () => {
    const plaintext = 'a secret message that must not leak into storage';

    const encrypted = await encryptContent(plaintext);

    expect(encrypted.ciphertext).not.toContain(plaintext);
    expect(
      Buffer.from(encrypted.ciphertext, 'base64').toString('utf8')
    ).not.toContain(plaintext);
  });

  it('round-trips binary content through encryptBuffer and decryptBuffer', async () => {
    const plaintext = Buffer.from([0, 1, 2, 253, 254, 255, 42, 7]);

    const encrypted = await encryptBuffer(plaintext);
    const decrypted = await decryptBuffer(
      encrypted.ciphertext,
      encrypted.encryptedDataKey,
      encrypted.iv
    );

    expect(decrypted.equals(plaintext)).toBe(true);
  });

  it('decrypts the same content again on a cache hit without a second KMS call', async () => {
    const plaintext = 'read this message twice';
    const encrypted = await encryptContent(plaintext);

    await decryptContent(
      encrypted.ciphertext,
      encrypted.encryptedDataKey,
      encrypted.iv
    );
    const secondRead = await decryptContent(
      encrypted.ciphertext,
      encrypted.encryptedDataKey,
      encrypted.iv
    );

    expect(secondRead).toBe(plaintext);
  });
});
