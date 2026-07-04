import { useEffect } from 'react';
import type { IMediaStatusEvent } from '@network/shared';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { useSocket } from './useSocket';
import { useToast } from './useToast';
import { videoApi } from '../../features/video/videoApi';
import { shortApi } from '../../features/short/shortApi';

export const useMediaStatusSocket = (): void => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const socketRef = useSocket(accessToken);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMediaStatus = (event: IMediaStatusEvent) => {
      if (event.mediaType === 'video') {
        dispatch(
          videoApi.util.invalidateTags([
            { type: 'Video', id: event.id },
            'MyVideos',
            'Video',
          ])
        );
      } else {
        dispatch(
          shortApi.util.invalidateTags([
            { type: 'Short', id: event.id },
            'MyShorts',
            'Short',
          ])
        );
      }

      if (event.status === 'READY') {
        addToast(`"${event.title}" is now live`, 'success');
      } else if (event.status === 'FAILED') {
        addToast(`Processing failed for "${event.title}"`, 'error');
      }
    };

    socket.on('media:status', handleMediaStatus);

    return () => {
      socket.off('media:status', handleMediaStatus);
    };
  }, [accessToken, dispatch, addToast]);
};
