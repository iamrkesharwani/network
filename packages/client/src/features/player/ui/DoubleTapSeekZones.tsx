import { useCallback, useEffect, useRef, type RefObject } from 'react';
import {
  PLAYER_DOUBLE_TAP_SEEK_SECONDS,
  PLAYER_DOUBLE_TAP_WINDOW_MS,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface DoubleTapSeekZonesProps {
  currentTimeRef: RefObject<number>;
  seek: (time: number) => void;
  onToggleControls: () => void;
  onCenterSingleTap?: () => void;
  onDoubleTapCenter?: () => void;
  className?: string;
}

function useTapZone(
  onSingleTap: () => void,
  onDoubleTap: () => void
): () => void {
  const pendingTapRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (pendingTapRef.current) window.clearTimeout(pendingTapRef.current);
    };
  }, []);

  return useCallback(() => {
    if (pendingTapRef.current) {
      window.clearTimeout(pendingTapRef.current);
      pendingTapRef.current = undefined;
      onDoubleTap();
      return;
    }

    pendingTapRef.current = window.setTimeout(() => {
      pendingTapRef.current = undefined;
      onSingleTap();
    }, PLAYER_DOUBLE_TAP_WINDOW_MS);
  }, [onSingleTap, onDoubleTap]);
}

const DoubleTapSeekZones = ({
  currentTimeRef,
  seek,
  onToggleControls,
  onCenterSingleTap,
  onDoubleTapCenter,
  className,
}: DoubleTapSeekZonesProps) => {
  const handleSeekBackward = useCallback(() => {
    seek(currentTimeRef.current - PLAYER_DOUBLE_TAP_SEEK_SECONDS);
  }, [currentTimeRef, seek]);

  const handleSeekForward = useCallback(() => {
    seek(currentTimeRef.current + PLAYER_DOUBLE_TAP_SEEK_SECONDS);
  }, [currentTimeRef, seek]);

  const handleLeftTap = useTapZone(onToggleControls, handleSeekBackward);
  const handleCenterTap = useTapZone(
    onCenterSingleTap ?? onToggleControls,
    onDoubleTapCenter ?? onToggleControls
  );
  const handleRightTap = useTapZone(onToggleControls, handleSeekForward);

  return (
    <div className={cn('absolute inset-0 flex', className)}>
      <button
        type="button"
        aria-label="Seek backward 10 seconds"
        onClick={handleLeftTap}
        className="h-full flex-1 touch-manipulation appearance-none border-0 bg-transparent p-0"
      />
      <button
        type="button"
        aria-label="Toggle controls"
        onClick={handleCenterTap}
        className="h-full flex-1 touch-manipulation appearance-none border-0 bg-transparent p-0"
      />
      <button
        type="button"
        aria-label="Seek forward 10 seconds"
        onClick={handleRightTap}
        className="h-full flex-1 touch-manipulation appearance-none border-0 bg-transparent p-0"
      />
    </div>
  );
};

export default DoubleTapSeekZones;
