import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] },
  reducers: {
    addNotification(state, action) {
      state.items.push({
        id: nextId++,
        type: 'info',
        duration: 5000,
        createdAt: Date.now(),
        ...action.payload,
      });
    },
    removeNotification(state, action) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearAllNotifications(state) {
      state.items = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } =
  notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.read).length;

export default notificationSlice.reducer;
