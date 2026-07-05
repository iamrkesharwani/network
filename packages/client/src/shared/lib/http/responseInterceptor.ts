import { AxiosError } from 'axios';
import { axiosInstance } from './axiosClient';
import { handleAuthRefresh } from './refreshToken';
import { handleCsrfRetry } from './csrf';
import type { CustomAxiosRequestConfig } from './types';

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/request-password-reset',
  '/auth/reset-password',
  '/auth/send-verification',
  '/auth/forgot-password',
];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((path) =>
      originalRequest.url?.includes(path)
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._authRetry &&
      !isPublicAuthPath
    ) {
      return handleAuthRefresh(originalRequest);
    }

    if (
      error.response?.status === 403 &&
      originalRequest &&
      !originalRequest._csrfRetry &&
      !originalRequest.url?.includes('/csrf-token')
    ) {
      return handleCsrfRetry(error, originalRequest);
    }

    return Promise.reject(error);
  }
);
