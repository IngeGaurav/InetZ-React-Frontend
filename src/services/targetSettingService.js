import { api, unwrapResponseModel } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

/**
 * Target Setting API calls (docs/TARGET_SETTING_ANALYSIS.md A.3). Every call returns the backend's
 * `{ status, data }` envelope.
 */
export const targetSettingService = {
  // Stored targets: [{ id, siteId, name, sector, method, targetYear, scope1, scope2, total,
  // reduction, totalReduction, baseYear }] — one row per site.
  getTargets: () => api.get(endpoints.target.list).then(unwrapResponseModel),

  // { label: [siteName], value: [target-year total] }
  getPieChart: () => api.get(endpoints.target.pieChart).then(unwrapResponseModel),

  // { label: [year], actual: [tCO2e], target: [tCO2e] }; `siteName` '' = whole organisation.
  getBarChart: (siteName) =>
    api.get(endpoints.target.barChart, { name: siteName ?? '' }).then(unwrapResponseModel),

  /**
   * Run a calculation — the page's only write. The backend answers HTTP 200 even on failure; the
   * real result is the body's `status` (200 = "ok", 400 = the literal string "failled"), so this
   * checks it by hand and throws an Error whose `.serverMessage` is the body's `data`.
   */
  calculate: async (payload) => {
    const res = await api.post(endpoints.target.list, payload);
    if (res?.status !== 200) {
      const error = new Error('Target calculation failed');
      error.serverMessage = typeof res?.data === 'string' ? res.data : '';
      throw error;
    }
    return res.data;
  },
};
