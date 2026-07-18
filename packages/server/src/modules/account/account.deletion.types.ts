export interface AccountDeletionAdapter {
  contentType: 'video' | 'short' | 'post' | 'follow';
  deleteAllForUser(userId: string): Promise<number>;
}
