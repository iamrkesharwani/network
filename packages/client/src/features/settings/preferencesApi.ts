import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IPreferences,
  PreferencesPatchInput,
} from '@network/shared';

export const preferencesApi = createApi({
  reducerPath: 'preferencesApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/preferences' }),
  endpoints: (builder) => ({
    getPreferences: builder.query<ApiResponse<IPreferences>, void>({
      query: () => ({ url: '', method: 'GET' }),
    }),
    patchPreferences: builder.mutation<
      ApiResponse<IPreferences>,
      PreferencesPatchInput
    >({
      query: (data) => ({ url: '', method: 'PATCH', data }),
    }),
  }),
});

export const { useLazyGetPreferencesQuery, usePatchPreferencesMutation } =
  preferencesApi;
