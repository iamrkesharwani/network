import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { REQUEST_TIMEOUT_MS } from '@network/shared';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let currentAccessToken: string | null = null;
let csrfToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

export const fetchCsrfToken = async () => {
  try {
    const response = await axiosInstance.get('/csrf-token');
    csrfToken = response.data.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (currentAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
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
        // implementation done later
        throw new Error('Refresh not implemented');
      } catch (refreshError) {
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
