/**
 * TanStack Query key factory.
 *
 * WHY a factory pattern?
 * - Prevents typos and magic strings scattered across hooks
 * - Enables fine-grained cache invalidation (invalidate all 'users' keys, or
 *   just the detail for user 42) with a single array prefix check
 * - Keeps all keys co-located so refactoring is safe
 *
 * Usage:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
 */
export const queryKeys = {
  // Auth
  auth: {
    all: () => ['auth'],
    profile: () => ['auth', 'profile'],
  },

  // Users
  users: {
    all: () => ['users'],
    lists: () => ['users', 'list'],
    list: (filters) => ['users', 'list', filters],
    details: () => ['users', 'detail'],
    detail: (id) => ['users', 'detail', id],
  },

  // Dashboard
  dashboard: {
    all: () => ['dashboard'],
    stats: () => ['dashboard', 'stats'],
    recentActivity: () => ['dashboard', 'recent-activity'],
  },

  // Annual Report route (/report/report) — see D:\InetZ\DECARB_REPORT_ANALYSIS.md
  report: {
    dropdown: (type) => ['report', 'dropdown', type],
    organisation: () => ['report', 'organisation'],
    orgChart: () => ['report', 'org-chart'],
    sites: () => ['report', 'sites'],
    baseYearScopeValues: () => ['report', 'base-year-scope-values'],
    emissionYearScopeValues: (year) => ['report', 'emission-year-scope-values', year],
    outputEmissions: (siteId, year) => ['report', 'output-emissions', siteId, year],
  },

  // Monthly Summary route (/report/monthly-summary) — see docs/MONTHLY_SUMMARY_ANALYSIS.md
  monthlySummary: {
    report: () => ['monthly-summary', 'report'],
  },

  // Generic paginated list helper
  paginatedList: (entity, params) => [entity, 'list', params],
};
