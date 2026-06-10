import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth/authSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
