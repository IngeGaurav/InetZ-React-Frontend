import { createSlice } from '@reduxjs/toolkit';
import { tokenUtils } from '@/utils/tokenUtils';
import { sessionStorage_ } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';

/**
 * Auth slice — stores identity, not credentials.
 *
 * The JWT itself lives in sessionStorage (managed by tokenUtils). Redux holds
 * the decoded user identity so any component can read isAuthenticated / user /
 * role without touching sessionStorage directly.
 *
 * `user` is whatever the backend's login response returns under `data`
 * (userName, id, role, userSiteAccessDetails) — see docs/auth-implementation.md.
 * There is no separate refresh token: on hard refresh, rehydrate from the
 * stored token + user only if the token hasn't expired yet.
 */

const rehydrateFromStorage = () => {
  const token = tokenUtils.getToken();
  const user = sessionStorage_.get(STORAGE_KEYS.USER);
  if (token && user && !tokenUtils.isExpired(token)) {
    return { isAuthenticated: true, user, token };
  }
  return { isAuthenticated: false, user: null, token: null };
};

const initialState = {
  ...rehydrateFromStorage(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.error = null;
      tokenUtils.setToken(token);
      sessionStorage_.set(STORAGE_KEYS.USER, user);
    },

    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      sessionStorage_.set(STORAGE_KEYS.USER, state.user);
    },

    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      tokenUtils.clearToken();
      sessionStorage_.remove(STORAGE_KEYS.USER);
    },

    setAuthLoading(state, action) {
      state.isLoading = action.payload;
    },

    setAuthError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const { setCredentials, updateUser, logout, setAuthLoading, setAuthError, clearAuthError } =
  authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserSiteAccess = (state) => state.auth.user?.userSiteAccessDetails;

export default authSlice.reducer;
