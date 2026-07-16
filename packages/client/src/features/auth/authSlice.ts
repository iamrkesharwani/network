import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './authApi';
import { settingsApi } from '../settings/settingsApi';
import { accountApi } from '../settings/accountApi';
import type { IUser } from '@network/shared';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: IUser;
        accessToken?: string;
        tokens?: { accessToken?: string };
      }>
    ) => {
      state.user = action.payload.user;
      const token =
        action.payload.accessToken ?? action.payload.tokens?.accessToken;
      if (token) {
        state.accessToken = token;
      }
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.data.user;
        if (action.payload.data.accessToken) {
          state.accessToken = action.payload.data.accessToken;
        }
        state.isAuthenticated = true;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addMatcher(authApi.endpoints.verifyEmail.matchFulfilled, (state) => {
        if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addMatcher(
        isAnyOf(
          settingsApi.endpoints.patchBasicProfile.matchFulfilled,
          settingsApi.endpoints.patchPersonalDetails.matchFulfilled,
          settingsApi.endpoints.patchContactLinks.matchFulfilled,
          settingsApi.endpoints.uploadAvatar.matchFulfilled,
          settingsApi.endpoints.captureLocation.matchFulfilled,
          accountApi.endpoints.reactivateAccount.matchFulfilled,
          authApi.endpoints.confirmEmailChange.matchFulfilled
        ),
        (state, action) => {
          state.user = action.payload.data;
        }
      )
      .addMatcher(
        authApi.endpoints.changePassword.matchFulfilled,
        (state, action) => {
          state.accessToken = action.payload.data.accessToken;
        }
      )
      .addMatcher(
        authApi.endpoints.confirmAddPassword.matchFulfilled,
        (state, action) => {
          state.user = action.payload.data.user;
          if (action.payload.data.accessToken) {
            state.accessToken = action.payload.data.accessToken;
          }
        }
      )
      .addMatcher(
        accountApi.endpoints.deactivateAccount.matchFulfilled,
        (state) => {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
        }
      );
  },
});

export const { setCredentials, clearCredentials, setToken, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
