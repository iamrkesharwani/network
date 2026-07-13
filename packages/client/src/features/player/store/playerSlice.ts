import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  isPictureInPicture: boolean;
  volumePreference: number;
}

const initialState: PlayerState = {
  isPictureInPicture: false,
  volumePreference: 1,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPictureInPicture: (state, action: PayloadAction<boolean>) => {
      state.isPictureInPicture = action.payload;
    },
    setVolumePreference: (state, action: PayloadAction<number>) => {
      state.volumePreference = action.payload;
    },
  },
});

export const { setPictureInPicture, setVolumePreference } = playerSlice.actions;
export default playerSlice.reducer;
