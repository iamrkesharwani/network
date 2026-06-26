import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { REQUEST_TIMEOUT_MS } from '@network/shared';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
  _csrfRetry?: boolean;
}

let currentAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}> = [];
let isFetchingCsrf = false;
let csrfQueue: Array<{
  resolve: () => void;
  reject: (reason?: any) => void;
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

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

const getCsrfTokenFromCookie = (): string | null => {
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

axiosInstance.interceptors.request.use(
  (config) => {
    if (currentAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    const csrf = getCsrfTokenFromCookie();
    if (csrf && config.headers) {
      config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const publicAuthPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/verify-email',
      '/auth/request-password-reset',
      '/auth/reset-password',
      '/auth/send-verification',
      '/auth/forgot-password',
    ];

    const isPublicAuthPath = publicAuthPaths.some((path) =>
      originalRequest.url?.includes(path)
    );

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._authRetry &&
      !isPublicAuthPath
    ) {
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
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (
      error.response?.status === 403 &&
      originalRequest &&
      !originalRequest._csrfRetry &&
      !originalRequest.url?.includes('/csrf-token')
    ) {
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
    }

    return Promise.reject(error);
  }
);
