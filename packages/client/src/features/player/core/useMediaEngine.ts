import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export interface MediaEngineError {
  code: number;
  message: string;
}

export interface BufferedRange {
  start: number;
  end: number;
}

type TimeSubscriber = (currentTime: number) => void;

interface UseMediaEngineResult {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  duration: number;
  playbackRate: number;
  isBuffering: boolean;
  error: MediaEngineError | null;
  currentTimeRef: RefObject<number>;
  bufferedRangesRef: RefObject<BufferedRange[]>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  subscribeToTime: (callback: TimeSubscriber) => () => void;
}

function readBufferedRanges(buffered: TimeRanges): BufferedRange[] {
  const ranges: BufferedRange[] = [];
  for (let i = 0; i < buffered.length; i += 1) {
    ranges.push({ start: buffered.start(i), end: buffered.end(i) });
  }
  return ranges;
}

export function useMediaEngine(
  videoRef: RefObject<HTMLVideoElement | null>
): UseMediaEngineResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<MediaEngineError | null>(null);

  const currentTimeRef = useRef(0);
  const bufferedRangesRef = useRef<BufferedRange[]>([]);
  const subscribersRef = useRef(new Set<TimeSubscriber>());

  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {
      setError({ code: 0, message: 'Playback could not start.' });
    });
  }, [videoRef]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) play();
    else pause();
  }, [videoRef, play, pause]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = Math.max(0, Math.min(time, video.duration || time));
      video.currentTime = clamped;
      currentTimeRef.current = clamped;
      subscribersRef.current.forEach((callback) => callback(clamped));
    },
    [videoRef]
  );

  const setVolume = useCallback(
    (nextVolume: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = Math.max(0, Math.min(1, nextVolume));
      video.volume = clamped;
      if (clamped > 0 && video.muted) video.muted = false;
    },
    [videoRef]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, [videoRef]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = rate;
      setPlaybackRateState(rate);
    },
    [videoRef]
  );

  const subscribeToTime = useCallback((callback: TimeSubscriber) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      currentTimeRef.current = video.currentTime;
      subscribersRef.current.forEach((callback) => callback(video.currentTime));
    };
    const handleProgress = () => {
      bufferedRangesRef.current = readBufferedRanges(video.buffered);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleVolumeChange = () => {
      setVolumeState(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoRef]);

  return {
    isPlaying,
    isMuted,
    volume,
    duration,
    playbackRate,
    isBuffering,
    error,
    currentTimeRef,
    bufferedRangesRef,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    subscribeToTime,
  };
}
