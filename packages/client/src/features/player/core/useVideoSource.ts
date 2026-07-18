import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { VideoSourceState } from '@network/shared';

export interface VideoSourceError {
  code: number;
  message: string;
}

interface UseVideoSourceResult {
  state: VideoSourceState;
  error: VideoSourceError | null;
  retry: () => void;
}

function describeMediaError(
  mediaError: MediaError | null
): VideoSourceError | null {
  if (!mediaError) return null;

  switch (mediaError.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return { code: mediaError.code, message: 'Playback was aborted.' };
    case MediaError.MEDIA_ERR_NETWORK:
      return {
        code: mediaError.code,
        message: 'A network error interrupted playback.',
      };
    case MediaError.MEDIA_ERR_DECODE:
      return {
        code: mediaError.code,
        message: 'The video could not be decoded.',
      };
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return {
        code: mediaError.code,
        message: 'This video format is not supported.',
      };
    default:
      return {
        code: mediaError.code,
        message: 'An unknown playback error occurred.',
      };
  }
}

export function useVideoSource(
  videoRef: RefObject<HTMLVideoElement | null>,
  playbackUrl: string | undefined
): UseVideoSourceResult {
  const [state, setState] = useState<VideoSourceState>('idle');
  const [error, setError] = useState<VideoSourceError | null>(null);

  const loadSrc = useCallback(() => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    setError(null);
    setState('loading');
    video.src = playbackUrl;
    video.load();
  }, [videoRef, playbackUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackUrl) {
      setState('idle');
      return;
    }

    const handleLoadStart = () => setState('loading');
    const handleLoadedMetadata = () => setError(null);
    const handleCanPlay = () => setState('ready');
    const handleWaiting = () => setState('buffering');
    const handleError = () => {
      setError(describeMediaError(video.error));
      setState('error');
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleError);

    loadSrc();

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleError);
      video.removeAttribute('src');
      video.load();
    };
  }, [videoRef, playbackUrl, loadSrc]);

  return { state, error, retry: loadSrc };
}
