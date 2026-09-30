import axios from 'axios';
import { tokenUtils } from '@/utils/tokenUtils';
import { API_TIMEOUT } from '@/constants/appConstants';

/**
 * Axios instance — the single HTTP client for the entire application.
 *
 * No refresh-token flow: the backend issues one JWT with a fixed 5-hour
 * expiry and no refresh endpoint at all (see docs/auth-implementation.md).
 * On a 401, the token is simply invalid/expired — clear it and broadcast
 * `auth:logout` so App.jsx can clear Redux state and React Query's cache;
 * ProtectedRoute then redirects to /login on the next render.
 *
 * Also note the backend's own login-failure quirk does NOT go through this
 * interceptor: POST /user/login always responds HTTP 200, even on bad
 * credentials — the real result is in the response body's `status` field.
 * That's handled in useAuth's login(), not here.
 */

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenUtils.clearToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
