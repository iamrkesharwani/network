import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../shared/hooks/useAppDispatch';
import {
  setCurrentVideo,
  setUploadProgress,
  clearUploadState,
} from './videoSlice';
import type { IVideoResponse } from '@network/shared';

export const useVideo = () => {
  const dispatch = useAppDispatch();
  const { currentVideo, uploadProgress, isUploading } = useAppSelector(
    (state) => state.video
  );

  const updateCurrentVideo = (video: IVideoResponse | null) => {
    dispatch(setCurrentVideo(video));
  };

  const updateUploadProgress = (progress: number) => {
    dispatch(setUploadProgress(progress));
  };

  const resetUpload = () => {
    dispatch(clearUploadState());
  };

  return {
    currentVideo,
    uploadProgress,
    isUploading,
    updateCurrentVideo,
    updateUploadProgress,
    resetUpload,
  };
};
