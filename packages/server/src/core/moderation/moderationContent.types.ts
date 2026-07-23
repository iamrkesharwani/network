import type {
  ModerationStatus,
  ReportableContentType,
  ReportContentModel,
} from '@network/shared';

export interface ModerationContentLookup {
  exists: boolean;
  ownerId: string | null;
}

export interface ModerationContentAdapter {
  contentType: ReportableContentType;
  contentModel: ReportContentModel;
  lookup(contentId: string): Promise<ModerationContentLookup>;
  setModerationStatus(
    contentId: string,
    status: ModerationStatus
  ): Promise<void>;
}
