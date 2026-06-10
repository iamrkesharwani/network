import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import uiReducer from './ui/uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
