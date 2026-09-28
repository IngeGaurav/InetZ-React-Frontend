/**
 * Centralized API endpoint definitions.
 *
 * Keeps all URLs in one file so a backend route change only requires editing here.
 * Functions accept IDs/slugs and return the full relative path.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
  },

  users: {
    list: '/users',
    create: '/users',
    detail: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    changePassword: (id) => `/users/${id}/change-password`,
  },

  dashboard: {
    stats: '/dashboard/stats',
    recentActivity: '/dashboard/recent-activity',
  },
};
