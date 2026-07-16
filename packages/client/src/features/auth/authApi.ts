import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../shared/lib/axiosBaseQuery';
import type {
  LoginInput,
  VerifyEmailInput,
  RequestResetPasswordInput,
  CompleteResetPasswordInput,
  UserRegistrationInput,
  ChangePasswordInput,
  ChangeEmailInput,
  ConfirmEmailChangeInput,
  ConfirmAddPasswordInput,
  IUser,
  ApiResponse,
} from '@network/shared';

type AuthSuccessResponse = ApiResponse<{
  user: IUser;
  accessToken?: string;
}>;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/auth' }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthSuccessResponse, UserRegistrationInput>({
      query: (data) => ({
        url: '/register',
        method: 'POST',
        data,
      }),
    }),
    login: builder.mutation<AuthSuccessResponse, LoginInput>({
      query: (data) => ({
        url: '/login',
        method: 'POST',
        data,
      }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    sendVerification: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (data) => ({
        url: '/send-verification',
        method: 'POST',
        data,
      }),
    }),
    verifyEmail: builder.mutation<ApiResponse<null>, VerifyEmailInput>({
      query: (data) => ({
        url: '/verify-email',
        method: 'POST',
        data,
      }),
    }),
    forgotPassword: builder.mutation<
      ApiResponse<null>,
      RequestResetPasswordInput
    >({
      query: (data) => ({
        url: '/request-password-reset',
        method: 'POST',
        data,
      }),
    }),
    resetPassword: builder.mutation<
      ApiResponse<null>,
      CompleteResetPasswordInput
    >({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        data,
      }),
    }),
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordInput>({
      query: (data) => ({
        url: '/change-password',
        method: 'POST',
        data,
      }),
    }),
    requestEmailChange: builder.mutation<ApiResponse<null>, ChangeEmailInput>({
      query: (data) => ({
        url: '/change-email/request',
        method: 'POST',
        data,
      }),
    }),
    confirmEmailChange: builder.mutation<
      ApiResponse<IUser>,
      ConfirmEmailChangeInput
    >({
      query: (data) => ({
        url: '/change-email/confirm',
        method: 'POST',
        data,
      }),
    }),
    requestAddPassword: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/add-password/request',
        method: 'POST',
      }),
    }),
    confirmAddPassword: builder.mutation<
      ApiResponse<IUser>,
      ConfirmAddPasswordInput
    >({
      query: (data) => ({
        url: '/add-password/confirm',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useSendVerificationMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useRequestAddPasswordMutation,
  useConfirmAddPasswordMutation,
} = authApi;
