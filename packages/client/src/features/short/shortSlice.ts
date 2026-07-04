import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { shortApi } from './shortApi';
import type { IShortResponse } from '@network/shared';

interface ShortState {
  currentShort: IShortResponse | null;
  uploadProgress: number;
  isUploading: boolean;
  activeIndex: number;
}

const initialState: ShortState = {
  currentShort: null,
  uploadProgress: 0,
  isUploading: false,
  activeIndex: 0,
};

const shortSlice = createSlice({
  name: 'short',
  initialState,
  reducers: {
    setCurrentShort: (state, action: PayloadAction<IShortResponse | null>) => {
      state.currentShort = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearUploadState: (state) => {
      state.uploadProgress = 0;
      state.isUploading = false;
    },
    setActiveIndex: (state, action: PayloadAction<number>) => {
      state.activeIndex = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(shortApi.endpoints.initiateUpload.matchPending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
      })
      .addMatcher(
        shortApi.endpoints.finaliseShort.matchFulfilled,
        (state, action) => {
          state.currentShort = action.payload.data.short;
          state.isUploading = false;
          state.uploadProgress = 100;
        }
      )
      .addMatcher(shortApi.endpoints.finaliseShort.matchRejected, (state) => {
        state.isUploading = false;
      })
      .addMatcher(
        shortApi.endpoints.getShortById.matchFulfilled,
        (state, action) => {
          state.currentShort = action.payload.data;
        }
      )
      .addMatcher(
        shortApi.endpoints.updateShort.matchFulfilled,
        (state, action) => {
          if (state.currentShort?.id === action.payload.data.id) {
            state.currentShort = action.payload.data;
          }
        }
      )
      .addMatcher(shortApi.endpoints.deleteShort.matchFulfilled, (state) => {
        state.currentShort = null;
      });
  },
});

export const {
  setCurrentShort,
  setUploadProgress,
  clearUploadState,
  setActiveIndex,
} = shortSlice.actions;
export default shortSlice.reducer;
