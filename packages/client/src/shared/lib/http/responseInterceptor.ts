import { AxiosError } from 'axios';
import { AUTH_PUBLIC_PATHS } from '@network/shared';
import { axiosInstance } from './axiosClient';
import { handleAuthRefresh } from './refreshToken';
import { handleCsrfRetry } from './csrf';
import type { CustomAxiosRequestConfig } from './types';

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isPublicAuthPath = AUTH_PUBLIC_PATHS.some((path) =>
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
