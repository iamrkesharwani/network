import { AxiosError } from 'axios';
import { axiosInstance } from './axiosClient';
import type { CustomAxiosRequestConfig } from './types';

export const getCsrfTokenFromCookie = (): string | null => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('_csrf='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

export const fetchCsrfToken = async (): Promise<void> => {
  try {
    await axiosInstance.get('/csrf-token');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

let isFetchingCsrf = false;
let csrfQueue: Array<{
  resolve: () => void;
  reject: (reason?: AxiosError) => void;
}> = [];

const processCsrfQueue = (error: AxiosError | null) => {
  csrfQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  csrfQueue = [];
};

export const handleCsrfRetry = async (
  error: AxiosError,
  originalRequest: CustomAxiosRequestConfig
) => {
  if (isFetchingCsrf) {
    return new Promise<void>((resolve, reject) => {
      csrfQueue.push({ resolve, reject });
    })
      .then(() => {
        return axiosInstance(originalRequest);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  originalRequest._csrfRetry = true;
  isFetchingCsrf = true;

  try {
    await fetchCsrfToken();
    processCsrfQueue(null);
    return axiosInstance(originalRequest);
  } catch (csrfError) {
    processCsrfQueue(csrfError as AxiosError);
    return Promise.reject(error);
  } finally {
    isFetchingCsrf = false;
  }
};
