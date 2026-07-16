export interface AccountDeletionAdapter {
  contentType: 'video' | 'short' | 'post';
  deleteAllForUser(userId: string): Promise<number>;
}
