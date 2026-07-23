import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import {
  MESSAGE_DEK_CACHE_KEY_PREFIX,
  MESSAGE_DEK_CACHE_TTL_SECONDS,
} from '@network/shared';
import { kmsProvider } from '../../../core/providers/provider.js';
import { redisClient } from '../../../core/config/redis.js';

const AES_GCM_ALGORITHM = 'aes-256-gcm';
const AES_GCM_IV_BYTE_LENGTH = 12;
const AES_GCM_AUTH_TAG_BYTE_LENGTH = 16;

export interface IEncryptedContent {
  ciphertext: string;
  encryptedDataKey: string;
  iv: string;
}

export interface IEncryptedBuffer {
  ciphertext: Buffer;
  encryptedDataKey: string;
  iv: string;
}

const getPlaintextDataKey = async (encryptedDataKey: string): Promise<Buffer> => {
  const cacheKey = MESSAGE_DEK_CACHE_KEY_PREFIX + encryptedDataKey;
  const cached = await redisClient.get(cacheKey);
  if (cached) return Buffer.from(cached, 'base64');

  const plaintextKey = await kmsProvider.decryptDataKey(encryptedDataKey);
  await redisClient.set(
    cacheKey,
    plaintextKey.toString('base64'),
    'EX',
    MESSAGE_DEK_CACHE_TTL_SECONDS
  );
  return plaintextKey;
};

const encryptBytes = (
  plaintextKey: Buffer,
  plaintext: Buffer
): { ciphertext: Buffer; iv: Buffer } => {
  const iv = randomBytes(AES_GCM_IV_BYTE_LENGTH);
  const cipher = createCipheriv(AES_GCM_ALGORITHM, plaintextKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { ciphertext: Buffer.concat([encrypted, authTag]), iv };
};

const decryptBytes = (
  plaintextKey: Buffer,
  ciphertext: Buffer,
  iv: Buffer
): Buffer => {
  const encrypted = ciphertext.subarray(
    0,
    ciphertext.length - AES_GCM_AUTH_TAG_BYTE_LENGTH
  );
  const authTag = ciphertext.subarray(
    ciphertext.length - AES_GCM_AUTH_TAG_BYTE_LENGTH
  );

  const decipher = createDecipheriv(AES_GCM_ALGORITHM, plaintextKey, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};

export const encryptContent = async (
  plaintext: string
): Promise<IEncryptedContent> => {
  const { plaintextKey, encryptedDataKey } =
    await kmsProvider.generateDataKey();
  const { ciphertext, iv } = encryptBytes(
    plaintextKey,
    Buffer.from(plaintext, 'utf8')
  );
  plaintextKey.fill(0);

  return {
    ciphertext: ciphertext.toString('base64'),
    encryptedDataKey,
    iv: iv.toString('base64'),
  };
};

export const decryptContent = async (
  ciphertext: string,
  encryptedDataKey: string,
  iv: string
): Promise<string> => {
  const plaintextKey = await getPlaintextDataKey(encryptedDataKey);
  const decrypted = decryptBytes(
    plaintextKey,
    Buffer.from(ciphertext, 'base64'),
    Buffer.from(iv, 'base64')
  );
  plaintextKey.fill(0);

  return decrypted.toString('utf8');
};

export const encryptBuffer = async (
  plaintext: Buffer
): Promise<IEncryptedBuffer> => {
  const { plaintextKey, encryptedDataKey } =
    await kmsProvider.generateDataKey();
  const { ciphertext, iv } = encryptBytes(plaintextKey, plaintext);
  plaintextKey.fill(0);

  return { ciphertext, encryptedDataKey, iv: iv.toString('base64') };
};

export const decryptBuffer = async (
  ciphertext: Buffer,
  encryptedDataKey: string,
  iv: string
): Promise<Buffer> => {
  const plaintextKey = await getPlaintextDataKey(encryptedDataKey);
  const decrypted = decryptBytes(
    plaintextKey,
    ciphertext,
    Buffer.from(iv, 'base64')
  );
  plaintextKey.fill(0);

  return decrypted;
};
