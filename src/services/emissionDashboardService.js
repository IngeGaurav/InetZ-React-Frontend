import { api, unwrapResponseModel } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

/**
 * Emission Dashboard API calls (see docs/EMISSION_DASHBOARD_ANALYSIS.md A.5). Every call is a GET
 * wrapped in the backend's `{ status, data }` envelope, unwrapped by `unwrapResponseModel`.
 *
 * `scope` is `{ base, suffix }` — which backend scope family to hit and its id path segment(s),
 * mirroring Angular's `currentDataScope()`. `marketBased` is sent as the literal query param
 * `?marketBased=true|false`, exactly as Angular does (Angular's variable for this is the
 * misleadingly-named, inverted `isLocationBased` — here it is named for what it means).
 */
const get = (url, params) => api.get(url, params).then(unwrapResponseModel);

const mb = (marketBased) => ({ marketBased: !!marketBased });

export const emissionDashboardService = {
  getSites: () => get(endpoints.general.site),

  getPlants: (siteId) => get(endpoints.emissions.plant(siteId)),

  // n: 'first' (overall) | 'second' (intensity) | 'third' (scope 1) | 'fourth' (scope 2) | 'fifth' (month/day)
  getTopGraph: (n, { base, suffix }, marketBased) =>
    get(
      endpoints.output.scoped(base, `topGraph${n[0].toUpperCase()}${n.slice(1)}`, suffix),
      mb(marketBased)
    ),

  getPieChart: (siteId, marketBased) =>
    get(
      siteId
        ? endpoints.output.scoped('siteLevel', 'pieChart', `/${siteId}/0`)
        : endpoints.output.scoped('organisation', 'pieChart'),
      mb(marketBased)
    ),

  getMonthlyEmission: ({ base, suffix }, marketBased) =>
    get(endpoints.output.scoped(base, 'tableMonthlyEmission', suffix), mb(marketBased)),

  getYearlyGraph: ({ base, suffix }, marketBased) =>
    get(endpoints.output.scoped(base, 'yearlyGraph', suffix), mb(marketBased)),

  getOverallGraph: ({ base, suffix }, marketBased) =>
    get(endpoints.output.scoped(base, 'overallGraph', suffix), mb(marketBased)),

  // Org layout: organisation / site (when a site filter is active). Site layout: siteLevel, which
  // takes only the siteId — there is no plant-scoped variant (A.5, B.10).
  getOverallTable: ({ siteId, filterSiteId }, marketBased) =>
    get(
      siteId
        ? endpoints.output.siteLevelOverallTable(siteId)
        : filterSiteId !== null && filterSiteId !== undefined
          ? endpoints.output.scoped('site', 'overallTable', `/${filterSiteId}`)
          : endpoints.output.scoped('organisation', 'overallTable'),
      mb(marketBased)
    ),

  getEquipmentTable: (siteId, marketBased) =>
    get(
      endpoints.output.equipmentTable(siteId),
      marketBased === undefined ? undefined : mb(marketBased)
    ),

  getEquipmentGraphBar: () => get(endpoints.output.equipmentGraphBar),
};
