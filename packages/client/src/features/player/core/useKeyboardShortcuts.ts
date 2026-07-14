import { useEffect, type RefObject } from 'react';
import { PLAYER_SEEK_STEP_SECONDS, PLAYER_VOLUME_STEP } from '@network/shared';

interface UseKeyboardShortcutsOptions {
  containerRef: RefObject<HTMLElement | null>;
  currentTimeRef: RefObject<number>;
  duration: number;
  volume: number;
  togglePlay: () => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleFullscreen: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onToggleCaptions?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts({
  containerRef,
  currentTimeRef,
  duration,
  volume,
  togglePlay,
  toggleMute,
  seek,
  setVolume,
  toggleFullscreen,
  onNavigatePrev,
  onNavigateNext,
  onToggleCaptions,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isContainerActive = () =>
      container.contains(document.activeElement) || container.matches(':hover');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || !isContainerActive()) return;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlay();
          return;
        case 'f':
        case 'F':
          event.preventDefault();
          toggleFullscreen();
          return;
        case 'm':
        case 'M':
          event.preventDefault();
          toggleMute();
          return;
        case 'c':
        case 'C':
          event.preventDefault();
          if (onToggleCaptions) onToggleCaptions();
          return;
        case 'ArrowLeft':
          event.preventDefault();
          seek(currentTimeRef.current - PLAYER_SEEK_STEP_SECONDS);
          return;
        case 'ArrowRight':
          event.preventDefault();
          seek(currentTimeRef.current + PLAYER_SEEK_STEP_SECONDS);
          return;
        case 'ArrowUp':
          event.preventDefault();
          if (onNavigatePrev) onNavigatePrev();
          else setVolume(volume + PLAYER_VOLUME_STEP);
          return;
        case 'ArrowDown':
          event.preventDefault();
          if (onNavigateNext) onNavigateNext();
          else setVolume(volume - PLAYER_VOLUME_STEP);
          return;
        default:
          break;
      }

      if (event.key >= '0' && event.key <= '9' && duration > 0) {
        event.preventDefault();
        seek(duration * (Number(event.key) / 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    containerRef,
    currentTimeRef,
    duration,
    volume,
    togglePlay,
    toggleMute,
    seek,
    setVolume,
    toggleFullscreen,
    onNavigatePrev,
    onNavigateNext,
    onToggleCaptions,
  ]);
}
