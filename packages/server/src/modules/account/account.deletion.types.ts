export interface AccountDeletionAdapter {
  contentType: 'video' | 'short' | 'post' | 'follow' | 'followRequest' | 'block';
  deleteAllForUser(userId: string): Promise<number>;
}
