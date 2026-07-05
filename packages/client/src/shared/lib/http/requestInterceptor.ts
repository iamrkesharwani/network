import { AxiosError } from 'axios';
import { axiosInstance } from './axiosClient';
import { getAccessToken } from './authToken';
import { getCsrfTokenFromCookie } from './csrf';

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const csrf = getCsrfTokenFromCookie();
    if (csrf && config.headers) {
      config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);
