import { useEffect, type RefObject } from 'react';

async function applyOrientationLock(isFullscreen: boolean): Promise<void> {
  try {
    if (isFullscreen) await screen.orientation.lock('landscape');
    else screen.orientation.unlock();
  } catch {}
}

export function useOrientationLock(
  containerRef: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFullscreenChange = () => {
      applyOrientationLock(document.fullscreenElement === container);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [containerRef]);
}
