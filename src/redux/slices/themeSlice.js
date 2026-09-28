import { createSlice } from '@reduxjs/toolkit';
import { storage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { THEME } from '@/constants/appConstants';

const getInitialTheme = () => storage.get(STORAGE_KEYS.THEME, THEME.SYSTEM);

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === THEME.DARK) {
    root.classList.add('dark');
  } else if (theme === THEME.LIGHT) {
    root.classList.remove('dark');
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
};

const initialTheme = getInitialTheme();

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initialTheme },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload;
      storage.set(STORAGE_KEYS.THEME, action.payload);
      applyTheme(action.payload);
    },
    toggleTheme(state) {
      const next = state.mode === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;
      state.mode = next;
      storage.set(STORAGE_KEYS.THEME, next);
      applyTheme(next);
    },
    initTheme(state) {
      applyTheme(state.mode);
    },
  },
});

export const { setTheme, toggleTheme, initTheme } = themeSlice.actions;

export const selectTheme = (state) => state.theme.mode;
export const selectIsDark = (state) => state.theme.mode === THEME.DARK;

export default themeSlice.reducer;
