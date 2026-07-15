import type { ReportableContentType } from '@network/shared';

export type JuryCaseTrigger = (
  contentType: ReportableContentType,
  contentId: string
) => Promise<void>;

const triggers: JuryCaseTrigger[] = [];

export const registerJuryCaseTrigger = (trigger: JuryCaseTrigger): void => {
  triggers.push(trigger);
};

export const runJuryCaseTriggers = async (
  contentType: ReportableContentType,
  contentId: string
): Promise<void> => {
  for (const trigger of triggers) {
    await trigger(contentType, contentId);
  }
};
