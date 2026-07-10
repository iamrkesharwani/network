export interface ContentReaperAdapter {
  contentType: 'video' | 'short' | 'post';
  reapExpiredSoftDeletes(): Promise<number>;
  expireUnlistedContent(): Promise<number>;
  warnExpiringUnlisted(): Promise<number>;
}
