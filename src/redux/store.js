import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import sidebarReducer from './slices/sidebarSlice';
import notificationReducer from './slices/notificationSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';

/**
 * Redux store — CLIENT-SIDE GLOBAL STATE ONLY.
 *
 * What belongs here vs TanStack Query:
 *
 *   Redux (this store):
 *   ─ Auth state (token presence, user identity, roles)
 *   ─ Theme / dark-mode preference
 *   ─ Sidebar open/collapsed
 *   ─ In-app notification queue (toasts generated server-side via WebSocket)
 *   ─ User preferences (locale, density, column visibility)
 *
 *   TanStack Query (NOT here):
 *   ─ Any data fetched from the API (users list, dashboard stats, etc.)
 *   ─ Anything with a loading/error state driven by a network request
 *
 * Rule of thumb: if it lives on the server, let React Query own it.
 * If it's purely ephemeral UI state or auth identity, put it in Redux.
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    notifications: notificationReducer,
    userPreferences: userPreferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable Date values in notifications
        ignoredActions: ['notifications/add'],
        ignoredPaths: ['notifications.items'],
      },
    }),
  devTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
});

export default store;
