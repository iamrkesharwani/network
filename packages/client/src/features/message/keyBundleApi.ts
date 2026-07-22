import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IKeyBundleOwnResponse,
  IKeyBundlePublicResponse,
  KeyBundlePublishInput,
} from '@network/shared';

export const keyBundleApi = createApi({
  reducerPath: 'keyBundleApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/keys' }),
  tagTypes: ['KeyBundle'],
  endpoints: (builder) => ({
    publishKeyBundle: builder.mutation<
      ApiResponse<IKeyBundleOwnResponse>,
      KeyBundlePublishInput
    >({
      query: (data) => ({ url: '/', method: 'POST', data }),
      invalidatesTags: ['KeyBundle'],
    }),

    getMyKeyBundle: builder.query<ApiResponse<IKeyBundleOwnResponse>, void>({
      query: () => ({ url: '/me', method: 'GET' }),
      providesTags: ['KeyBundle'],
    }),

    getPublicKey: builder.query<ApiResponse<IKeyBundlePublicResponse>, string>({
      query: (userId) => ({ url: `/${userId}/public`, method: 'GET' }),
    }),

    getPublicKeys: builder.query<
      ApiResponse<IKeyBundlePublicResponse[]>,
      string[]
    >({
      query: (userIds) => ({
        url: '/public',
        method: 'GET',
        params: { userIds: userIds.join(',') },
      }),
    }),
  }),
});

export const {
  usePublishKeyBundleMutation,
  useGetMyKeyBundleQuery,
  useLazyGetMyKeyBundleQuery,
  useGetPublicKeyQuery,
  useGetPublicKeysQuery,
} = keyBundleApi;
