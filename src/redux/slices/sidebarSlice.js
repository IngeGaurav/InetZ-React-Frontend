import { createSlice } from '@reduxjs/toolkit';
import { storage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    isCollapsed: storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
    isMobileOpen: false,
  },
  reducers: {
    toggleSidebar(state) {
      state.isCollapsed = !state.isCollapsed;
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, state.isCollapsed);
    },
    setSidebarCollapsed(state, action) {
      state.isCollapsed = action.payload;
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, action.payload);
    },
    toggleMobileSidebar(state) {
      state.isMobileOpen = !state.isMobileOpen;
    },
    closeMobileSidebar(state) {
      state.isMobileOpen = false;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, toggleMobileSidebar, closeMobileSidebar } =
  sidebarSlice.actions;

export const selectSidebarCollapsed = (state) => state.sidebar.isCollapsed;
export const selectMobileSidebarOpen = (state) => state.sidebar.isMobileOpen;

export default sidebarSlice.reducer;
