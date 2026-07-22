import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../auth/authApi';

interface MessageKeyState {
  privateKey: CryptoKey | null;
}

const initialState: MessageKeyState = {
  privateKey: null,
};

const messageKeySlice = createSlice({
  name: 'messageKey',
  initialState,
  reducers: {
    setPrivateKey: (state, action: PayloadAction<CryptoKey | null>) => {
      state.privateKey = action.payload;
    },
    clearPrivateKey: (state) => {
      state.privateKey = null;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.privateKey = null;
    });
  },
});

export const { setPrivateKey, clearPrivateKey } = messageKeySlice.actions;
export default messageKeySlice.reducer;
