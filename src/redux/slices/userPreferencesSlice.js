import { createSlice } from '@reduxjs/toolkit';
import { storage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const defaultPreferences = {
  language: 'en',
  dateFormat: 'MM/dd/yyyy',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
  pageSize: 20,
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState: {
    ...defaultPreferences,
    ...storage.get(STORAGE_KEYS.USER_PREFERENCES, {}),
  },
  reducers: {
    setPreference(state, action) {
      const { key, value } = action.payload;
      state[key] = value;
      storage.set(STORAGE_KEYS.USER_PREFERENCES, { ...state });
    },
    setPreferences(state, action) {
      Object.assign(state, action.payload);
      storage.set(STORAGE_KEYS.USER_PREFERENCES, { ...state });
    },
    resetPreferences() {
      storage.set(STORAGE_KEYS.USER_PREFERENCES, defaultPreferences);
      return defaultPreferences;
    },
  },
});

export const { setPreference, setPreferences, resetPreferences } = userPreferencesSlice.actions;

export const selectUserPreferences = (state) => state.userPreferences;
export const selectDensity = (state) => state.userPreferences.density;
export const selectPageSize = (state) => state.userPreferences.pageSize;
export const selectLanguage = (state) => state.userPreferences.language;

export default userPreferencesSlice.reducer;
