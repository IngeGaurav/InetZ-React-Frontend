import { api } from '@/api/helpers';
import { endpoints } from '@/api/endpoints';

/**
 * Auth service — all API calls related to authentication.
 *
 * Kept separate from the Redux slice so the slice stays pure (no API calls)
 * and these functions are independently testable.
 *
 * `login` intentionally returns the raw response body, not `.data` unwrapped
 * further — the backend always responds HTTP 200, even on bad credentials,
 * and puts the real result in a `status` field inside the body. Callers
 * (useAuth) must inspect that field themselves. See docs/auth-implementation.md.
 */
export const authService = {
  login: (credentials) => api.post(endpoints.auth.login, credentials),

  logout: () => api.delete(endpoints.auth.logout),

  getProfile: () => api.get(endpoints.auth.me),

  forgotPassword: (email) => api.post(endpoints.auth.forgotPassword, { email }),
};
