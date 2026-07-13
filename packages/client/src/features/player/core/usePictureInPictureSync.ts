import { useEffect, type RefObject } from 'react';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { setPictureInPicture } from '../store/playerSlice';

export function usePictureInPictureSync(
  videoRef: RefObject<HTMLVideoElement | null>
): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnter = () => dispatch(setPictureInPicture(true));
    const handleLeave = () => dispatch(setPictureInPicture(false));

    video.addEventListener('enterpictureinpicture', handleEnter);
    video.addEventListener('leavepictureinpicture', handleLeave);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnter);
      video.removeEventListener('leavepictureinpicture', handleLeave);
    };
  }, [videoRef, dispatch]);
}
