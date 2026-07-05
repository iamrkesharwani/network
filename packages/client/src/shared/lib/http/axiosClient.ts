import axios from 'axios';
import { REQUEST_TIMEOUT_MS } from '@network/shared';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});
