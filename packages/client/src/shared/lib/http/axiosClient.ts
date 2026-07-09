import axios from 'axios';
import { REQUEST_TIMEOUT_MS, DEFAULT_API_URL } from '@network/shared';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});
