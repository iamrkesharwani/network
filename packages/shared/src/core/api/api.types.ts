export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: CursorPaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type AuthTokens = {
  accessToken: string;
};
