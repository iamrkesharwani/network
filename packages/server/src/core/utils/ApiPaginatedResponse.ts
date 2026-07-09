import type {
  PaginatedResponse as IPaginatedResponse,
  CursorPaginationMeta,
} from '@network/shared';

export class ApiPaginatedResponse<T> implements IPaginatedResponse<T> {
  public success: true = true;

  constructor(
    public data: T[],
    public meta: CursorPaginationMeta,
    public message: string = 'Success'
  ) {}
}
