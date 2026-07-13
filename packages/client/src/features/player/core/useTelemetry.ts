import { useEffect, type RefObject } from 'react';
import { PLAYER_TELEMETRY_INTERVAL_MS } from '@network/shared';
import { axiosInstance } from '../../../shared/lib/http/axiosClient';
import { getAccessToken } from '../../../shared/lib/http/authToken';
import { getCsrfTokenFromCookie } from '../../../shared/lib/http/csrf';

interface UseTelemetryOptions {
  videoId: string;
  userId: string | undefined;
  currentTimeRef: RefObject<number>;
}

function sendProgress(videoId: string, userId: string, currentTime: number): void {
  const token = getAccessToken();
  const csrf = getCsrfTokenFromCookie();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (csrf) headers['X-CSRF-Token'] = csrf;

  fetch(`${axiosInstance.defaults.baseURL}/telemetry/progress`, {
    method: 'POST',
    headers,
    credentials: 'include',
    keepalive: true,
    body: JSON.stringify({ userId, videoId, currentTime }),
  }).catch(() => {});
}

export function useTelemetry({ videoId, userId, currentTimeRef }: UseTelemetryOptions): void {
  useEffect(() => {
    if (!userId) return;

    const tick = () => sendProgress(videoId, userId, currentTimeRef.current);

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
  }, [videoId, userId, currentTimeRef]);
}
