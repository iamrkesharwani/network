import {
  MESSAGE_OEMBED_PROVIDERS,
  type IMessageLinkPreview,
} from '@network/shared';

export {
  encodeMessagePayload,
  decodeMessagePayload,
  type IMessagePayload,
} from '@network/shared';

const URL_PATTERN = /https?:\/\/\S+/i;

const findOembedProvider = (url: URL) =>
  MESSAGE_OEMBED_PROVIDERS.find((provider) =>
    (provider.hostnames as readonly string[]).includes(url.hostname)
  );

export const fetchLinkPreview = async (
  text: string
): Promise<IMessageLinkPreview | undefined> => {
  const match = text.match(URL_PATTERN);
  if (!match) return undefined;

  let url: URL;
  try {
    url = new URL(match[0]);
  } catch {
    return undefined;
  }

  const provider = findOembedProvider(url);
  if (!provider) return undefined;

  try {
    const response = await fetch(
      `${provider.endpoint}?format=json&url=${encodeURIComponent(url.toString())}`
    );
    if (!response.ok) return undefined;

    const data = (await response.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    if (!data.title) return undefined;

    return {
      provider: provider.name,
      url: url.toString(),
      title: data.title,
      ...(data.author_name && { authorName: data.author_name }),
      ...(data.thumbnail_url && { thumbnailUrl: data.thumbnail_url }),
    };
  } catch {
    return undefined;
  }
};
