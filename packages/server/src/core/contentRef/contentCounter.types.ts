import type { EngageableContentType } from '@network/shared';

export interface ContentCounterAdapter {
  contentType: EngageableContentType;
  incrementLikes(contentId: string): Promise<number>;
  decrementLikes(contentId: string): Promise<number>;
  incrementComments?(contentId: string): Promise<number>;
  decrementComments?(contentId: string): Promise<number>;
  incrementShares?(contentId: string): Promise<number>;
}
