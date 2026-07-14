import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PLAYER_CONTROLS_AUTO_HIDE_MS } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

export interface TouchInactivityLayerHandle {
  reveal: () => void;
  toggle: () => void;
}

interface TouchInactivityLayerProps {
  children: ReactNode;
  disableAutoHide?: boolean;
  className?: string;
}

const TouchInactivityLayer = forwardRef<
  TouchInactivityLayerHandle,
  TouchInactivityLayerProps
>(({ children, disableAutoHide = false, className }, ref) => {
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

  const reveal = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const hide = useCallback(() => {
    clearHideTimer();
    setControlsVisible(false);
  }, [clearHideTimer]);

  const toggle = useCallback(() => {
    setControlsVisible((visible) => {
      const next = !visible;
      if (next) scheduleHide();
      else clearHideTimer();
      return next;
    });
  }, [scheduleHide, clearHideTimer]);

  useImperativeHandle(ref, () => ({ reveal, toggle }), [reveal, toggle]);

  useEffect(() => {
    scheduleHide();
    return clearHideTimer;
  }, [scheduleHide, clearHideTimer]);

  return (
    <div
      data-controls-visible={controlsVisible}
      onTouchStart={reveal}
      onMouseEnter={reveal}
      onMouseMove={reveal}
      onMouseLeave={hide}
      className={cn('relative h-full w-full', className)}
    >
      {children}
    </div>
  );
});

TouchInactivityLayer.displayName = 'TouchInactivityLayer';

export default TouchInactivityLayer;
