import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  ICreatorProfile,
  ICreatorCatalog,
} from '@network/shared';

export const creatorApi = createApi({
  reducerPath: 'creatorApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/creator' }),
  tagTypes: ['Creator'],
  endpoints: (builder) => ({
    getMyProfile: builder.query<ApiResponse<ICreatorProfile>, void>({
      query: () => ({ url: '/me', method: 'GET' }),
      providesTags: ['Creator'],
    }),

    getCatalog: builder.query<ApiResponse<ICreatorCatalog>, void>({
      query: () => ({ url: '/catalog', method: 'GET' }),
    }),
  }),
});

export const { useGetMyProfileQuery, useGetCatalogQuery } = creatorApi;
