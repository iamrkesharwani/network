import type { IMessageLinkPreview } from './message.types.js';

export interface IMessagePayload {
  text: string;
  linkPreview?: IMessageLinkPreview;
}

export const encodeMessagePayload = (payload: IMessagePayload): string =>
  JSON.stringify(payload);

export const decodeMessagePayload = (raw: string): IMessagePayload => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as IMessagePayload).text === 'string'
    ) {
      return parsed as IMessagePayload;
    }
  } catch {
    // Not a JSON-encoded payload; treat the whole decrypted string as plain text.
  }
  return { text: raw };
};
