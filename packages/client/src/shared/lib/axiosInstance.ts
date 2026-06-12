import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { REQUEST_TIMEOUT_MS } from '@network/shared';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let currentAccessToken: string | null = null;

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

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axiosInstance.post<{
          data: { accessToken: string };
        }>('/auth/refresh');

        const newAccessToken = data.data.accessToken;
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
