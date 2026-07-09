import { AxiosError } from 'axios';
import { CLIENT_ROUTES } from '@network/shared';
import { axiosInstance } from './axiosClient';
import { setAccessToken } from './authToken';
import { fetchCsrfToken } from './csrf';
import type { CustomAxiosRequestConfig } from './types';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: AxiosError) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const handleAuthRefresh = async (
  originalRequest: CustomAxiosRequestConfig
) => {
  if (isRefreshing) {
    return new Promise<string | null>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        if (originalRequest.headers && token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  originalRequest._authRetry = true;
  isRefreshing = true;

  try {
    const { data } = await axiosInstance.post<{
      data: { accessToken: string };
    }>('/auth/refresh');

    const newAccessToken = data.data.accessToken;
    setAccessToken(newAccessToken);

    await fetchCsrfToken();

    processQueue(null, newAccessToken);

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    }

    return axiosInstance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError as AxiosError, null);
    setAccessToken(null);
    window.location.href = CLIENT_ROUTES.LOGIN;
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};
