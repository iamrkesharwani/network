import type { ApiErrorResponse } from '@network/shared';

const isApiErrorResponse = (data: unknown): data is ApiErrorResponse =>
  typeof data === 'object' &&
  data !== null &&
  'success' in data &&
  (data as { success: unknown }).success === false &&
  'error' in data;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data: unknown }).data;
    if (isApiErrorResponse(data)) return data.error.message;
    if (typeof data === 'string') return data;
  }
  return fallback;
};
