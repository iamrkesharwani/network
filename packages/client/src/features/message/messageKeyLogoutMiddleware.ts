import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { authApi } from '../auth/authApi';
import { clearCachedPrivateKey } from './localKeyStore';
import { isPinConfigured } from './pinLockStore';

interface MessageKeyLogoutMiddlewareState {
  auth: { user: { id: string } | null };
}

export const messageKeyLogoutMiddleware: Middleware<
  object,
  MessageKeyLogoutMiddlewareState
> = (store) => (next) => (action) => {
  const typedAction = action as UnknownAction;
  const userId = store.getState().auth.user?.id;

  const result = next(action);

  if (userId && authApi.endpoints.logout.matchFulfilled(typedAction)) {
    // Only PIN-locked devices need this: without a PIN, the raw key is
    // meant to stay silently cached across sign-outs (point 4). With a
    // PIN, a fresh sign-in should require the PIN again, not just reuse
    // whatever was cached from the previous session.
    if (isPinConfigured(userId)) {
      void clearCachedPrivateKey(userId);
    }
  }

  return result;
};
