import {
  KEY_BUNDLE_PBKDF2_MIN_ITERATIONS,
  KEY_BUNDLE_RECOVERY_TOKEN_BYTES,
} from '@network/shared';

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

const SAFETY_NUMBER_GROUP_COUNT = 4;
const SAFETY_NUMBER_GROUP_DIGITS = 5;

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
  keyVersion: number;
}

export interface IEncryptedKeyEntry {
  recipientId: string;
  encryptedKey: string;
  keyVersion: number;
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

/**
 * Everything needed to decrypt a message regardless of when it was sent:
 * the currently active private key plus every retired one this device has
 * cached, keyed by the version they were wrapped under. A message's
 * encryptedKeys entry records which version it was wrapped to, so decrypt
 * picks the right key instead of always assuming the active one.
 */
export interface IMessageKeyRing {
  activeKeyVersion: number;
  historicalKeys: Map<number, CryptoKey>;
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

export const generateRecoveryToken = (): string => {
  const bytes = crypto.getRandomValues(
    new Uint8Array(KEY_BUNDLE_RECOVERY_TOKEN_BYTES)
  );
  return bufferToBase64(bytes.buffer);
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

export const generateMessageKey = (): Promise<CryptoKey> =>
  crypto.subtle.generateKey(
    { name: AES_GCM_ALGORITHM, length: AES_GCM_KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

export const wrapMessageKeyForRecipients = async (
  messageKey: CryptoKey,
  recipients: IRecipientPublicKey[]
): Promise<IEncryptedKeyEntry[]> => {
  const rawMessageKey = await crypto.subtle.exportKey('raw', messageKey);

  return Promise.all(
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
        keyVersion: recipient.keyVersion,
      };
    })
  );
};

export const encryptTextWithKey = async (
  messageKey: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTE_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_GCM_ALGORITHM, iv },
    messageKey,
    new TextEncoder().encode(plaintext)
  );

  return { ciphertext: bufferToBase64(ciphertext), iv: bufferToBase64(iv.buffer) };
};

export const encryptForRecipients = async (
  plaintext: string,
  recipients: IRecipientPublicKey[]
): Promise<IEncryptedPayload> => {
  const messageKey = await generateMessageKey();
  const { ciphertext, iv } = await encryptTextWithKey(messageKey, plaintext);
  const encryptedKeys = await wrapMessageKeyForRecipients(messageKey, recipients);

  return { ciphertext, iv, encryptedKeys };
};

/**
 * Encrypts raw file bytes with an already-generated message key, using a
 * distinct IV from the text envelope. Recipients who unwrap that same key to
 * read the envelope can reuse it unmodified to decrypt the attachment — no
 * separate per-recipient key-wrap is needed for the file.
 */
export const encryptFile = async (
  messageKey: CryptoKey,
  fileBuffer: ArrayBuffer
): Promise<{ ciphertext: ArrayBuffer; iv: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTE_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_GCM_ALGORITHM, iv },
    messageKey,
    fileBuffer
  );

  return { ciphertext, iv: bufferToBase64(iv.buffer) };
};

export const decryptFile = async (
  messageKey: CryptoKey,
  ciphertext: ArrayBuffer,
  ivBase64: string
): Promise<ArrayBuffer> => {
  const iv = new Uint8Array(base64ToBuffer(ivBase64));
  return crypto.subtle.decrypt(
    { name: AES_GCM_ALGORITHM, iv },
    messageKey,
    ciphertext
  );
};

export const unwrapMessageKey = async (
  message: IEncryptedMessageInput,
  myPrivateKey: CryptoKey,
  myUserId: string,
  keyRing?: IMessageKeyRing
): Promise<CryptoKey> => {
  const myEntry = message.encryptedKeys.find(
    (entry) => entry.recipientId === myUserId
  );
  if (!myEntry) {
    throw new Error('No encrypted key found for this user.');
  }

  const unwrapWith =
    keyRing && myEntry.keyVersion !== keyRing.activeKeyVersion
      ? (keyRing.historicalKeys.get(myEntry.keyVersion) ?? myPrivateKey)
      : myPrivateKey;

  const rawMessageKey = await crypto.subtle.decrypt(
    { name: RSA_OAEP_ALGORITHM },
    unwrapWith,
    base64ToBuffer(myEntry.encryptedKey)
  );

  return crypto.subtle.importKey(
    'raw',
    rawMessageKey,
    AES_GCM_ALGORITHM,
    false,
    ['decrypt']
  );
};

/**
 * A safety number is a symmetric fingerprint of both participants' public
 * keys — computing it in either direction yields the same code, so two
 * people can read theirs aloud and confirm they match without either being
 * "first" or "second". A mismatch means at least one side's public key
 * isn't what the other actually has, the MITM/impersonation signal this
 * exists to catch.
 */
export const computeSafetyNumber = async (
  myUserId: string,
  myPublicKey: string,
  theirUserId: string,
  theirPublicKey: string
): Promise<string> => {
  const [first, second] =
    myUserId < theirUserId
      ? [`${myUserId}:${myPublicKey}`, `${theirUserId}:${theirPublicKey}`]
      : [`${theirUserId}:${theirPublicKey}`, `${myUserId}:${myPublicKey}`];

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${first}|${second}`)
  );
  const bytes = new Uint8Array(digest);

  const groups: string[] = [];
  for (let i = 0; i < SAFETY_NUMBER_GROUP_COUNT; i += 1) {
    const offset = i * 4;
    const value =
      ((bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]) >>>
      0;
    groups.push(
      (value % 10 ** SAFETY_NUMBER_GROUP_DIGITS)
        .toString()
        .padStart(SAFETY_NUMBER_GROUP_DIGITS, '0')
    );
  }

  return groups.join(' ');
};

export const decryptMessage = async (
  message: IEncryptedMessageInput,
  myPrivateKey: CryptoKey,
  myUserId: string,
  keyRing?: IMessageKeyRing
): Promise<string> => {
  const messageKey = await unwrapMessageKey(
    message,
    myPrivateKey,
    myUserId,
    keyRing
  );

  const iv = new Uint8Array(base64ToBuffer(message.iv));
  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: AES_GCM_ALGORITHM, iv },
    messageKey,
    base64ToBuffer(message.ciphertext)
  );

  return new TextDecoder().decode(plaintextBuffer);
};
