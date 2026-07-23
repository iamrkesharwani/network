import axios from 'axios';

const rawHttp = axios.create();

export const uploadEncryptedAttachment = (
  uploadUrl: string,
  ciphertext: ArrayBuffer
): Promise<unknown> =>
  rawHttp.put(uploadUrl, ciphertext, {
    headers: { 'Content-Type': 'application/octet-stream' },
  });
