import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IUserPreferences,
  UpdatePreferencesInput,
} from '@network/shared';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/user' }),
  endpoints: (builder) => ({
    updatePreferences: builder.mutation<
      ApiResponse<IUserPreferences>,
      UpdatePreferencesInput
    >({
      query: (data) => ({
        url: '/preferences',
        method: 'PATCH',
        data,
      }),
    }),
  }),
});

export const { useUpdatePreferencesMutation } = userApi;
