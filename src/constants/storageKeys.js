/**
 * All localStorage / sessionStorage keys in one place.
 * Prevents key collisions and makes a future namespace prefix change trivial.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: import.meta.env.VITE_AUTH_TOKEN_KEY || 'app_access_token',
  REFRESH_TOKEN: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'app_refresh_token',
  USER: 'app_user',
  THEME: 'app_theme',
  SIDEBAR_COLLAPSED: 'app_sidebar_collapsed',
  USER_PREFERENCES: 'app_user_preferences',
  REDIRECT_URL: 'app_redirect_url',
};
