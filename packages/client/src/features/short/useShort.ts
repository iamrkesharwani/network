import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../shared/hooks/useAppDispatch';
import type { IShortResponse } from '../../../../shared/src';
import {
  clearUploadState,
  setActiveIndex,
  setCurrentShort,
  setUploadProgress,
} from './shortSlice';

export const useShort = () => {
  const dispatch = useAppDispatch();
  const { currentShort, uploadProgress, isUploading, activeIndex } =
    useAppSelector((state) => state.short);

  const updateCurrentShort = (short: IShortResponse | null) => {
    dispatch(setCurrentShort(short));
  };

  const updateUploadProgress = (progress: number) => {
    dispatch(setUploadProgress(progress));
  };

  const resetUpload = () => {
    dispatch(clearUploadState());
  };

  const goToIndex = (index: number) => {
    dispatch(setActiveIndex(index));
  };

  const goNext = () => {
    dispatch(setActiveIndex(activeIndex + 1));
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      dispatch(setActiveIndex(activeIndex - 1));
    }
  };

  return {
    currentShort,
    uploadProgress,
    isUploading,
    activeIndex,
    updateCurrentShort,
    updateUploadProgress,
    resetUpload,
    goToIndex,
    goNext,
    goPrev,
  };
};
