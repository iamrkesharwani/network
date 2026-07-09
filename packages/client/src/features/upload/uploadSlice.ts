import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UploadStage, MultipartMediaType } from '@network/shared';
import type { WizardStep } from '../../shared/upload/UploadSteps';

export interface UploadWizardState {
  step: WizardStep;
  mediaId: string | null;
  sessionId: string | null;
  fingerprint: string | null;
  stage: UploadStage;
  uploadedParts: number[];
  totalParts: number;
  progressPercent: number;
  thumbnailUrl: string | undefined;
  finalMedia: Record<string, unknown> | null;
}

const createInitialWizardState = (): UploadWizardState => ({
  step: 'drop',
  mediaId: null,
  sessionId: null,
  fingerprint: null,
  stage: 'idle',
  uploadedParts: [],
  totalParts: 0,
  progressPercent: 0,
  thumbnailUrl: undefined,
  finalMedia: null,
});

interface UploadSliceState {
  byMediaType: Partial<Record<MultipartMediaType, UploadWizardState>>;
}

const initialState: UploadSliceState = {
  byMediaType: {},
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setWizardState: (
      state,
      action: PayloadAction<{
        mediaType: MultipartMediaType;
        patch: Partial<UploadWizardState>;
      }>
    ) => {
      const { mediaType, patch } = action.payload;
      const existing =
        state.byMediaType[mediaType] ?? createInitialWizardState();
      state.byMediaType[mediaType] = { ...existing, ...patch };
    },
    resetWizardState: (
      state,
      action: PayloadAction<{ mediaType: MultipartMediaType }>
    ) => {
      state.byMediaType[action.payload.mediaType] = createInitialWizardState();
    },
  },
});

export const { setWizardState, resetWizardState } = uploadSlice.actions;

export const selectWizardState =
  (mediaType: MultipartMediaType) =>
  (state: { upload: UploadSliceState }): UploadWizardState =>
    state.upload.byMediaType[mediaType] ?? createInitialWizardState();

export default uploadSlice.reducer;
