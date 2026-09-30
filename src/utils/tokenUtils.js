import { sessionStorage_ } from './storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';

/**
 * Token management utilities.
 *
 * The backend issues a single JWT with a fixed 5-hour expiry and NO refresh
 * mechanism at all (see docs/auth-implementation.md) — there is deliberately
 * no refresh-token handling here to mirror that contract. Stored in
 * sessionStorage (not localStorage) to match the Angular app's tab-scoped
 * session model.
 *
 * XSS RISK: Any token in sessionStorage is readable by JS. Mitigate with:
 *   1. Strict CSP (see index.html comments)
 *   2. Input sanitization (DOMPurify for user-supplied HTML)
 * This is an interim measure — revisit if the backend auth revamp adds
 * httpOnly cookie-based sessions.
 */

export const tokenUtils = {
  getToken() {
    return sessionStorage_.get(STORAGE_KEYS.TOKEN);
  },

  setToken(token) {
    sessionStorage_.set(STORAGE_KEYS.TOKEN, token);
  },

  clearToken() {
    sessionStorage_.remove(STORAGE_KEYS.TOKEN);
  },

  /** Decode a JWT payload WITHOUT verification (client-side only). */
  decodePayload(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  },

  isExpired(token) {
    const payload = this.decodePayload(token);
    if (!payload?.exp) {
      return true;
    }
    return Date.now() >= payload.exp * 1000;
  },

  isTokenExpired() {
    const token = this.getToken();
    if (!token) {
      return true;
    }
    return this.isExpired(token);
  },
};
