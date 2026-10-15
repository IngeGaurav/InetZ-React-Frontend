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

  // Real backend contract (Spring Boot `DecarbController`/`EmissionsController`/`OutPutController`)
  // — see D:\InetZ\DECARB_REPORT_ANALYSIS.md for the full trace. All wrapped in the same
  // `{ status, data }` envelope as auth (see docs/auth-implementation.md) — unwrap with
  // `unwrapReportResponse` in reportService.js, don't assume axios's HTTP status alone.
  general: {
    site: '/general/site',
    dropdown: '/general/dropdown', // ?type=&tabName=
    organisation: '/general/organisation',
    orgChart: '/general/orgChart',
  },

  emissions: {
    site: '/emissions/site',
    plant: (siteId) => `/emissions/plant/${siteId}`,
  },

  output: {
    reportBaseYearScopeValues: '/output/getReportBaseYearScopeValues',
    reportEmissionYearScopeValues: '/output/getReportEmisisoYearScopeValues', // ?year=
    outputEmissions: (siteId) => `/output/organisation/outputEmissions/${siteId}`, // ?year=
    monthlyReport: '/output/monthlyReport',

    // Emission Dashboard (/dashboard/emission-dashboard) � see docs/EMISSION_DASHBOARD_ANALYSIS.md
    // A.5. `base` is 'organisation' | 'site' | 'siteLevel'; `suffix` is '' | '/{siteId}' |
    // '/{siteId}/{plantId}' depending on base. All take ?marketBased=.
    scoped: (base, name, suffix = '') => `/output/${base}/${name}${suffix}`,
    equipmentTable: (siteId) => `/output/equipmentTable/${siteId}`,
    equipmentGraphBar: '/output/equipmentGraphBar',
    siteLevelOverallTable: (siteId) => `/output/siteLevel/overallTable/${siteId}`,
  },
};
