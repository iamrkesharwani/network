import type { EngageableContentType } from '@network/shared';
import type { ContentCounterAdapter } from './contentCounter.types.js';

const adaptersByContentType = new Map<
  EngageableContentType,
  ContentCounterAdapter
>();

export const registerContentCounterAdapter = (
  adapter: ContentCounterAdapter
): void => {
  adaptersByContentType.set(adapter.contentType, adapter);
};

export const getContentCounterAdapter = (
  contentType: EngageableContentType
): ContentCounterAdapter | undefined => adaptersByContentType.get(contentType);
