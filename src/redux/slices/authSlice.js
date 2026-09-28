import { createSlice } from '@reduxjs/toolkit';
import { tokenUtils } from '@/utils/tokenUtils';
import { storage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';

/**
 * Auth slice — stores identity, not credentials.
 *
 * The JWT itself lives in localStorage (managed by tokenUtils).
 * Redux holds the decoded user identity so any component can read
 * isAuthenticated / user / roles without touching localStorage.
 *
 * On hard refresh, rehydrate from the stored token via initialState.
 */

const rehydrateFromStorage = () => {
  const token = tokenUtils.getAccessToken();
  const user = storage.get(STORAGE_KEYS.USER);
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
      const { user, accessToken, refreshToken } = action.payload;
      state.isAuthenticated = true;
      state.user = user;
      state.token = accessToken;
      state.error = null;
      tokenUtils.setTokens({ accessToken, refreshToken });
      storage.set(STORAGE_KEYS.USER, user);
    },

    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      storage.set(STORAGE_KEYS.USER, state.user);
    },

    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      tokenUtils.clearTokens();
      storage.remove(STORAGE_KEYS.USER);
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

export default authSlice.reducer;
