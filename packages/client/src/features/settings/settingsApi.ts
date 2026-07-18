import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  ApiResponse,
  IUser,
  BasicProfileInput,
  PersonalDetailsInput,
  ContactLinksInput,
  CaptureLocationInput,
  BannerPresetSelectInput,
} from '@network/shared';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/user' }),
  endpoints: (builder) => ({
    patchBasicProfile: builder.mutation<ApiResponse<IUser>, BasicProfileInput>({
      query: (data) => ({ url: '/profile/basic', method: 'PATCH', data }),
    }),
    patchPersonalDetails: builder.mutation<
      ApiResponse<IUser>,
      PersonalDetailsInput
    >({
      query: (data) => ({ url: '/profile/personal', method: 'PATCH', data }),
    }),
    patchContactLinks: builder.mutation<ApiResponse<IUser>, ContactLinksInput>({
      query: (data) => ({ url: '/profile/contact', method: 'PATCH', data }),
    }),
    uploadAvatar: builder.mutation<ApiResponse<IUser>, FormData>({
      query: (data) => ({
        url: '/profile/avatar',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    uploadBanner: builder.mutation<ApiResponse<IUser>, FormData>({
      query: (data) => ({
        url: '/profile/banner',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    }),
    selectBannerPreset: builder.mutation<
      ApiResponse<IUser>,
      BannerPresetSelectInput
    >({
      query: (data) => ({ url: '/profile/banner/preset', method: 'PATCH', data }),
    }),
    captureLocation: builder.mutation<ApiResponse<IUser>, CaptureLocationInput>(
      {
        query: (data) => ({ url: '/location/capture', method: 'POST', data }),
      }
    ),
  }),
});

export const {
  usePatchBasicProfileMutation,
  usePatchPersonalDetailsMutation,
  usePatchContactLinksMutation,
  useUploadAvatarMutation,
  useUploadBannerMutation,
  useSelectBannerPresetMutation,
  useCaptureLocationMutation,
} = settingsApi;
