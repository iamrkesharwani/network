import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  token: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setToken, setInitialized } = authSlice.actions;
export default authSlice.reducer;
