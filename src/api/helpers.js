import apiClient from './axios';

/**
 * Generic REST helpers that wrap Axios with consistent response unwrapping.
 *
 * WHY unwrap .data?
 * Every Axios response is wrapped in { data, status, headers, ... }.
 * Callers care about the payload, not the transport envelope.
 * Unwrapping here means every consumer gets a clean object.
 */

export const api = {
  get: (url, params, config = {}) => apiClient.get(url, { params, ...config }).then((r) => r.data),

  post: (url, body, config = {}) => apiClient.post(url, body, config).then((r) => r.data),

  put: (url, body, config = {}) => apiClient.put(url, body, config).then((r) => r.data),

  patch: (url, body, config = {}) => apiClient.patch(url, body, config).then((r) => r.data),

  delete: (url, config = {}) => apiClient.delete(url, config).then((r) => r.data),

  /** Upload files using multipart/form-data with progress tracking. */
  upload: (url, formData, onUploadProgress) =>
    apiClient
      .post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then((r) => r.data),
};

/**
 * Unwrap the backend's `ResponseModel { status, data }` envelope, present on every endpoint
 * (`DecarbController`/`EmissionsController`/`OutPutController`/`UserController` all wrap this
 * way — see D:\InetZ\DECARB_REPORT_ANALYSIS.md and docs/auth-implementation.md). This is a
 * second envelope *inside* the HTTP body — axios resolving successfully only means the HTTP
 * transport succeeded, not that `status` here is 200. Angular checks this by hand at every call
 * site (`if (response.status == 200)`); this helper does the same, throwing so callers can rely
 * on a normal try/catch instead of re-checking `.status` everywhere.
 */
export const unwrapResponseModel = (response) => {
  if (response?.status !== 200) {
    const error = new Error(`Request failed with body status ${response?.status}`);
    error.responseModel = response;
    throw error;
  }
  return response.data;
};

/**
 * Extract a human-readable error message from an Axios error.
 * Server error messages take precedence over generic HTTP status text.
 */
export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Build query string params for paginated list endpoints.
 */
export const buildPaginationParams = ({ page = 1, pageSize = 20, search, sortBy, sortOrder }) => {
  const params = { page, pageSize };
  if (search) {
    params.search = search;
  }
  if (sortBy) {
    params.sortBy = sortBy;
  }
  if (sortOrder) {
    params.sortOrder = sortOrder;
  }
  return params;
};
