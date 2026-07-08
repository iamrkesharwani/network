import { useCallback } from 'react';
import { useAppSelector } from '../../shared/hooks/useAppSelector';
import { useAppDispatch } from '../../shared/hooks/useAppDispatch';
import type { IShortResponse } from '@network/shared';
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

  const updateCurrentShort = useCallback(
    (short: IShortResponse | null) => {
      dispatch(setCurrentShort(short));
    },
    [dispatch]
  );

  const updateUploadProgress = useCallback(
    (progress: number) => {
      dispatch(setUploadProgress(progress));
    },
    [dispatch]
  );

  const resetUpload = useCallback(() => {
    dispatch(clearUploadState());
  }, [dispatch]);

  const goToIndex = useCallback(
    (index: number) => {
      dispatch(setActiveIndex(index));
    },
    [dispatch]
  );

  const goNext = useCallback(() => {
    dispatch(setActiveIndex(activeIndex + 1));
  }, [dispatch, activeIndex]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      dispatch(setActiveIndex(activeIndex - 1));
    }
  }, [dispatch, activeIndex]);

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
