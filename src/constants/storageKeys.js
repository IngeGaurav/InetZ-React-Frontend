/**
 * All localStorage / sessionStorage keys in one place.
 * Prevents key collisions and makes a future namespace prefix change trivial.
 */
export const STORAGE_KEYS = {
  // Auth keys live in sessionStorage (tab-scoped), matching the Angular app's session model —
  // see docs/auth-implementation.md. TOKEN mirrors Angular's literal 'token' key so the two
  // apps are easy to cross-check in DevTools during the migration.
  TOKEN: 'token',
  USER: 'auth_user',

  THEME: 'app_theme',
  SIDEBAR_COLLAPSED: 'app_sidebar_collapsed',
  USER_PREFERENCES: 'app_user_preferences',
  REDIRECT_URL: 'app_redirect_url',
};
