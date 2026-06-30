import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IGamificationProfile,
  IAchievementCatalogEntry,
} from '@network/shared';

export const gamificationApi = createApi({
  reducerPath: 'gamificationApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/gamification' }),
  tagTypes: ['Gamification'],
  endpoints: (builder) => ({
    getMyProfile: builder.query<ApiResponse<IGamificationProfile>, void>({
      query: () => ({
        url: '/me',
        method: 'POST',
      }),
      providesTags: ['Gamification'],
    }),

    getCatalog: builder.query<ApiResponse<IAchievementCatalogEntry[]>, void>({
      query: () => ({
        url: '/catalog',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetMyProfileQuery, useGetCatalogQuery } = gamificationApi;
