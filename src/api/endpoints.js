/**
 * Centralized API endpoint definitions.
 *
 * Keeps all URLs in one file so a backend route change only requires editing here.
 * Functions accept IDs/slugs and return the full relative path.
 */
export const endpoints = {
  // Real backend contract (Spring Boot `UserController`) — see docs/auth-implementation.md.
  // No refresh endpoint exists; `me` returns only { role, userSiteAccessDetails }, not a full
  // profile (name/email only ever come back from `login`).
  auth: {
    login: '/user/login',
    logout: '/user/logout',
    forgotPassword: '/user/forgot',
    resetPassword: '/user/resetnow',
    me: '/user/dtls',
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
