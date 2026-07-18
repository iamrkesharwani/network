import { useEffect, type RefObject } from 'react';
import { axiosInstance } from '../../../shared/lib/http/axiosClient';
import { getAccessToken } from '../../../shared/lib/http/authToken';
import { getCsrfTokenFromCookie } from '../../../shared/lib/http/csrf';
import {
  PLAYER_TELEMETRY_INTERVAL_MS,
  type HistoryContentType,
} from '@network/shared';

interface UseTelemetryOptions {
  contentType: HistoryContentType;
  contentId: string;
  userId: string | undefined;
  currentTimeRef: RefObject<number>;
  duration: number;
}

function sendProgress(
  contentType: HistoryContentType,
  contentId: string,
  currentTime: number,
  duration: number
): void {
  const token = getAccessToken();
  const csrf = getCsrfTokenFromCookie();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;

  fetch(`${axiosInstance.defaults.baseURL}/history/progress`, {
    method: 'POST',
    headers,
    credentials: 'include',
    keepalive: true,
    body: JSON.stringify({
      contentType,
      contentId,
      currentTime,
      ...(duration > 0 && { duration }),
    }),
  }).catch(() => {});
}

export function useTelemetry({
  contentType,
  contentId,
  userId,
  currentTimeRef,
  duration,
}: UseTelemetryOptions): void {
  useEffect(() => {
    if (!userId || !contentId) return;

    const tick = () =>
      sendProgress(contentType, contentId, currentTimeRef.current, duration);

    const intervalId = window.setInterval(tick, PLAYER_TELEMETRY_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') tick();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      tick();
    };
  }, [contentType, contentId, userId, currentTimeRef, duration]);
}
