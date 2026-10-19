import { api, unwrapResponseModel } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

/**
 * Edit/Enter Data API calls (docs/EDIT_ENTER_DATA_ANALYSIS.md A.3) — a direct port of Angular's
 * calls, no behavioural changes. Every response is the backend's `{ status, data }` envelope.
 */
export const editEnterDataService = {
  // `site` / `plant`: numeric ids, -1 = "All" (sent as-is, as Angular does).
  // → [{ type, tag, uom, site, plant, value, newValue, timestamp, id }]
  getRows: ({ date, site, plant }) =>
    api
      .get(endpoints.emissions.getEditDetails, { timestamp: date, site, plant: plant || 0 })
      .then(unwrapResponseModel),

  /**
   * POST the whole table (Angular posts every row, edited or not). Resolves with the raw
   * envelope: Angular only acts when `status === 200` and ignores any other body status, so the
   * caller checks it (a business failure is still an HTTP 200).
   */
  saveRows: (rows) => api.post(endpoints.emissions.postEditDetails, rows),
};
