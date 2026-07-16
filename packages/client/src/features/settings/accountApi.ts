import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IUser,
  DeactivateAccountInput,
  DeleteAccountInput,
} from '@network/shared';

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/account' }),
  endpoints: (builder) => ({
    deactivateAccount: builder.mutation<ApiResponse<IUser>, DeactivateAccountInput>({
      query: (data) => ({ url: '/deactivate', method: 'POST', data }),
    }),
    reactivateAccount: builder.mutation<ApiResponse<IUser>, void>({
      query: () => ({ url: '/reactivate', method: 'POST' }),
    }),
    deleteAccount: builder.mutation<ApiResponse<IUser>, DeleteAccountInput>({
      query: (data) => ({ url: '/delete', method: 'POST', data }),
    }),
  }),
});

export const {
  useDeactivateAccountMutation,
  useReactivateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;
