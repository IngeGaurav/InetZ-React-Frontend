import { api } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

/**
 * Auth service — all API calls related to authentication.
 *
 * Kept separate from the Redux slice so the slice stays pure (no API calls)
 * and these functions are independently testable.
 */
export const authService = {
  login: (credentials) => api.post(endpoints.auth.login, credentials),

  logout: () => api.post(endpoints.auth.logout),

  getProfile: () => api.get(endpoints.auth.me),

  forgotPassword: (email) => api.post(endpoints.auth.forgotPassword, { email }),

  resetPassword: (token, passwords) =>
    api.post(endpoints.auth.resetPassword, { token, ...passwords }),
};
