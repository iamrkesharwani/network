import type { InternalAxiosRequestConfig } from 'axios';

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
  _csrfRetry?: boolean;
}
