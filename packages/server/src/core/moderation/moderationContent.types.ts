import type { ReportableContentType } from '@network/shared';

export interface ModerationContentLookup {
  exists: boolean;
  ownerId: string | null;
}

export interface ModerationContentAdapter {
  contentType: ReportableContentType;
  contentModel: 'Video' | 'Short' | 'Post' | 'Comment';
  lookup(contentId: string): Promise<ModerationContentLookup>;
}
