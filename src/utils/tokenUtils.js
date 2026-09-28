import { storage } from './storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';

/**
 * Token management utilities.
 *
 * WHY localStorage over httpOnly cookies here?
 * Cookies require server-side configuration (SameSite, Secure, etc.) and
 * aren't accessible from JS for manual injection into Authorization headers.
 * This app manages tokens client-side. If your backend supports httpOnly
 * refresh tokens, move refreshToken to a cookie and only keep accessToken here.
 *
 * XSS RISK: Any token in localStorage is readable by JS. Mitigate with:
 *   1. Strict CSP (see index.html comments)
 *   2. Input sanitization (DOMPurify for user-supplied HTML)
 *   3. Short access token TTL + refresh token rotation
 */

export const tokenUtils = {
  getAccessToken() {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token) {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getRefreshToken() {
    return storage.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token) {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  setTokens({ accessToken, refreshToken }) {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  },

  clearTokens() {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
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

  isAccessTokenExpired() {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }
    return this.isExpired(token);
  },
};
