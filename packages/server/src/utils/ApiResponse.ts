import type { ApiResponse as IApiResponse } from '@network/shared';

export class ApiResponse<T> implements IApiResponse<T> {
  public success: true = true;

  constructor(
    public data: T,
    public message: string = 'Success'
  ) {}
}
