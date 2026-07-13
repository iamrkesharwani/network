import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PLAYER_CONTROLS_AUTO_HIDE_MS } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface TouchInactivityLayerProps {
  children: ReactNode;
  disableAutoHide?: boolean;
  className?: string;
}

const TouchInactivityLayer = ({
  children,
  disableAutoHide = false,
  className,
}: TouchInactivityLayerProps) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<number | undefined>(undefined);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (disableAutoHide) return;
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, PLAYER_CONTROLS_AUTO_HIDE_MS);
  }, [clearHideTimer, disableAutoHide]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return clearHideTimer;
  }, [scheduleHide, clearHideTimer]);

  return (
    <div
      data-controls-visible={controlsVisible}
      onTouchStart={revealControls}
      className={cn('relative h-full w-full', className)}
    >
      {children}
    </div>
  );
};

export default TouchInactivityLayer;
