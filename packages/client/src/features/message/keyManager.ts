import { KEY_BUNDLE_PBKDF2_MIN_ITERATIONS } from '@network/shared';

const RSA_OAEP_ALGORITHM = 'RSA-OAEP';
const RSA_OAEP_MODULUS_LENGTH = 2048;
const RSA_OAEP_HASH = 'SHA-256';
const RSA_OAEP_PUBLIC_EXPONENT = new Uint8Array([0x01, 0x00, 0x01]);

const AES_GCM_ALGORITHM = 'AES-GCM';
const AES_GCM_KEY_LENGTH = 256;
const AES_GCM_IV_BYTE_LENGTH = 12;

const PBKDF2_HASH = 'SHA-256';
const PBKDF2_SALT_BYTE_LENGTH = 16;

const BASE64_CHUNK_SIZE = 0x8000;

export interface IGeneratedKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface IWrappedPrivateKey {
  wrappedPrivateKey: string;
  wrapIv: string;
  wrapSalt: string;
  pbkdf2Iterations: number;
}

export interface IRecipientPublicKey {
  userId: string;
  publicKey: string;
}

export interface IEncryptedKeyEntry {
  recipientId: string;
  encryptedKey: string;
}

export interface IEncryptedPayload {
  ciphertext: string;
  iv: string;
  encryptedKeys: IEncryptedKeyEntry[];
}

export interface IEncryptedMessageInput {
  ciphertext: string;
  iv: string;
  encryptedKeys: IEncryptedKeyEntry[];
}

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + BASE64_CHUNK_SIZE)
    );
  }
  return btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const generateKeyPair = async (): Promise<IGeneratedKeyPair> => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: RSA_OAEP_ALGORITHM,
      modulusLength: RSA_OAEP_MODULUS_LENGTH,
      publicExponent: RSA_OAEP_PUBLIC_EXPONENT,
      hash: RSA_OAEP_HASH,
    },
    true,
    ['encrypt', 'decrypt']
  );

  return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
};

export const exportPublicKey = async (
  publicKey: CryptoKey
): Promise<string> => {
  const spki = await crypto.subtle.exportKey('spki', publicKey);
  return bufferToBase64(spki);
};

export const importPublicKey = async (
  publicKeyBase64: string
): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'spki',
    base64ToBuffer(publicKeyBase64),
    { name: RSA_OAEP_ALGORITHM, hash: RSA_OAEP_HASH },
    true,
    ['encrypt']
  );

const deriveWrappingKey = async (
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number
): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    { name: AES_GCM_ALGORITHM, length: AES_GCM_KEY_LENGTH },
    false,
    ['wrapKey', 'unwrapKey']
  );
};

export const wrapPrivateKey = async (
  privateKey: CryptoKey,
  passphrase: string,
  iterations: number = KEY_BUNDLE_PBKDF2_MIN_ITERATIONS
): Promise<IWrappedPrivateKey> => {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTE_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTE_LENGTH));
  const wrappingKey = await deriveWrappingKey(passphrase, salt, iterations);

  const wrapped = await crypto.subtle.wrapKey(
    'pkcs8',
    privateKey,
    wrappingKey,
    {
      name: AES_GCM_ALGORITHM,
      iv,
    }
  );

  return {
    wrappedPrivateKey: bufferToBase64(wrapped),
    wrapIv: bufferToBase64(iv.buffer),
    wrapSalt: bufferToBase64(salt.buffer),
    pbkdf2Iterations: iterations,
  };
};

export const unwrapPrivateKey = async (
  wrapped: IWrappedPrivateKey,
  passphrase: string
): Promise<CryptoKey> => {
  const salt = new Uint8Array(base64ToBuffer(wrapped.wrapSalt));
  const iv = new Uint8Array(base64ToBuffer(wrapped.wrapIv));
  const wrappingKey = await deriveWrappingKey(
    passphrase,
    salt,
    wrapped.pbkdf2Iterations
  );

  return crypto.subtle.unwrapKey(
    'pkcs8',
    base64ToBuffer(wrapped.wrappedPrivateKey),
    wrappingKey,
    { name: AES_GCM_ALGORITHM, iv },
    { name: RSA_OAEP_ALGORITHM, hash: RSA_OAEP_HASH },
    true,
    ['decrypt']
  );
};

export const encryptForRecipients = async (
  plaintext: string,
  recipients: IRecipientPublicKey[]
): Promise<IEncryptedPayload> => {
  const messageKey = await crypto.subtle.generateKey(
    { name: AES_GCM_ALGORITHM, length: AES_GCM_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTE_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_GCM_ALGORITHM, iv },
    messageKey,
    new TextEncoder().encode(plaintext)
  );

  const rawMessageKey = await crypto.subtle.exportKey('raw', messageKey);

  const encryptedKeys = await Promise.all(
    recipients.map(async (recipient) => {
      const recipientPublicKey = await importPublicKey(recipient.publicKey);
      const wrappedKey = await crypto.subtle.encrypt(
        { name: RSA_OAEP_ALGORITHM },
        recipientPublicKey,
        rawMessageKey
      );

      return {
        recipientId: recipient.userId,
        encryptedKey: bufferToBase64(wrappedKey),
      };
    })
  );

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
    encryptedKeys,
  };
};

export const decryptMessage = async (
  message: IEncryptedMessageInput,
  myPrivateKey: CryptoKey,
  myUserId: string
): Promise<string> => {
  const myEntry = message.encryptedKeys.find(
    (entry) => entry.recipientId === myUserId
  );
  if (!myEntry) {
    throw new Error('No encrypted key found for this user.');
  }

  const rawMessageKey = await crypto.subtle.decrypt(
    { name: RSA_OAEP_ALGORITHM },
    myPrivateKey,
    base64ToBuffer(myEntry.encryptedKey)
  );

  const messageKey = await crypto.subtle.importKey(
    'raw',
    rawMessageKey,
    AES_GCM_ALGORITHM,
    false,
    ['decrypt']
  );

  const iv = new Uint8Array(base64ToBuffer(message.iv));
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: AES_GCM_ALGORITHM, iv },
    messageKey,
    base64ToBuffer(message.ciphertext)
  );

  return new TextDecoder().decode(plaintextBuffer);
};
