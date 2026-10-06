import { api, unwrapResponseModel } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

/**
 * API calls backing the Annual Report route (/report/report) — see
 * D:\InetZ\DECARB_REPORT_ANALYSIS.md for the full Angular→backend trace each of these mirrors.
 */
export const reportService = {
  getDropdown: (type) => api.get(endpoints.general.dropdown, { type }).then(unwrapResponseModel),

  getOrganisation: () => api.get(endpoints.general.organisation).then(unwrapResponseModel),

  getOrgChart: () => api.get(endpoints.general.orgChart).then(unwrapResponseModel),

  getSites: () => api.get(endpoints.emissions.site).then(unwrapResponseModel),

  getBaseYearScopeValues: () =>
    api.get(endpoints.output.reportBaseYearScopeValues).then(unwrapResponseModel),

  getEmissionYearScopeValues: (year) =>
    api.get(endpoints.output.reportEmissionYearScopeValues, { year }).then(unwrapResponseModel),

  getOutputEmissions: (siteId, year) =>
    api.get(endpoints.output.outputEmissions(siteId), { year }).then(unwrapResponseModel),

  // Backs /report/monthly-summary — see docs/MONTHLY_SUMMARY_ANALYSIS.md. Response is cached
  // server-side (a static field, invalidated on data recalculation) and takes no params — always
  // "current month vs. previous month" as of when the backend last computed it.
  getMonthlyReport: () => api.get(endpoints.output.monthlyReport).then(unwrapResponseModel),
};
