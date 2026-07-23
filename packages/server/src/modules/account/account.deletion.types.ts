export interface AccountDeletionAdapter {
  contentType: 'video' | 'short' | 'post' | 'follow' | 'followRequest';
  deleteAllForUser(userId: string): Promise<number>;
}
