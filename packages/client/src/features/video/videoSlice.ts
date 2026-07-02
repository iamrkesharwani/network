import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { videoApi } from './videoApi';
import type { IVideoResponse } from '@network/shared';

interface VideoState {
  currentVideo: IVideoResponse | null;
  uploadProgress: number;
  isUploading: boolean;
}

const initialState: VideoState = {
  currentVideo: null,
  uploadProgress: 0,
  isUploading: false,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<IVideoResponse | null>) => {
      state.currentVideo = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearUploadState: (state) => {
      state.uploadProgress = 0;
      state.isUploading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(videoApi.endpoints.initiateUpload.matchPending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
      })
      .addMatcher(
        videoApi.endpoints.finaliseVideo.matchFulfilled,
        (state, action) => {
          state.currentVideo = action.payload.data.video;
          state.isUploading = false;
          state.uploadProgress = 100;
        }
      )
      .addMatcher(videoApi.endpoints.finaliseVideo.matchRejected, (state) => {
        state.isUploading = false;
      })
      .addMatcher(
        videoApi.endpoints.getVideoById.matchFulfilled,
        (state, action) => {
          state.currentVideo = action.payload.data;
        }
      )
      .addMatcher(
        videoApi.endpoints.updateVideo.matchFulfilled,
        (state, action) => {
          if (state.currentVideo?.id === action.payload.data.id) {
            state.currentVideo = action.payload.data;
          }
        }
      )
      .addMatcher(videoApi.endpoints.deleteVideo.matchFulfilled, (state) => {
        state.currentVideo = null;
      });
  },
});

export const { setCurrentVideo, setUploadProgress, clearUploadState } =
  videoSlice.actions;
export default videoSlice.reducer;
