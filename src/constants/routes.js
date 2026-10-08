/**
 * Centralized route path constants.
 * Import these instead of hard-coding paths in components and <Link> elements.
 */
export const ROUTES = {
  // Public
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // App root
  HOME: '/',

  // Dashboard � Angular parks these under /report/* (they share MonitorModule with the report
  // pages); React groups them under /dashboard. See docs/EMISSION_DASHBOARD_ANALYSIS.md A.1.
  // ROUTES.DASHBOARD itself just redirects to the emission dashboard (also the post-login target).
  DASHBOARD: '/dashboard',
  DASHBOARD_EMISSION: '/dashboard/emission-dashboard',
  DASHBOARD_EMISSION_EQUIPMENT: '/dashboard/emission-dashboard/equipment',
  // Sidebar links only for now � pages not built yet (fall through to the 404 route).
  DASHBOARD_TARGET_SETTING: '/dashboard/target-setting',
  DASHBOARD_EDIT_ENTER_DATA: '/dashboard/edit-enter-data',

  // Report
  REPORT_REPORT: '/report/report',
  REPORT_MONTHLY_SUMMARY: '/report/monthly-summary',

  // Profile
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Error
  NOT_FOUND: '/404',
  ERROR: '/error',
};
