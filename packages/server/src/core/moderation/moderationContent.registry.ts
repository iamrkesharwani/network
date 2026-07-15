import type { ReportableContentType } from '@network/shared';
import type { ModerationContentAdapter } from './moderationContent.types.js';

const adaptersByContentType = new Map<
  ReportableContentType,
  ModerationContentAdapter
>();

export const registerModerationContentAdapter = (
  adapter: ModerationContentAdapter
): void => {
  adaptersByContentType.set(adapter.contentType, adapter);
};

export const getModerationContentAdapter = (
  contentType: ReportableContentType
): ModerationContentAdapter | undefined =>
  adaptersByContentType.get(contentType);
