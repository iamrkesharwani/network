import type { ContentReaperAdapter } from './contentReaper.types.js';

const adapters: ContentReaperAdapter[] = [];

export const registerContentReaperAdapter = (
  adapter: ContentReaperAdapter
): void => {
  adapters.push(adapter);
};

export const getContentReaperAdapters = (): ContentReaperAdapter[] => adapters;
