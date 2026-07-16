import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  isPictureInPicture: boolean;
}

const initialState: PlayerState = {
  isPictureInPicture: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPictureInPicture: (state, action: PayloadAction<boolean>) => {
      state.isPictureInPicture = action.payload;
    },
  },
});

export const { setPictureInPicture } = playerSlice.actions;
export default playerSlice.reducer;
