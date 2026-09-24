import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Storage keys for authentication credentials
const ACCESS_TOKEN_KEY = 'chipa_access_token';
const REFRESH_TOKEN_KEY = 'chipa_refresh_token';
const PRE_AUTH_TOKEN_KEY = 'chipa_pre_auth_token';

// In-memory cache for synchronous token retrieval (prevents async latency in Axios interceptors)
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let isInitialized = false;

/**
 * Universal secure storage helper with web fallback
 */
const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (err) {
        console.warn(`[secureStorage] Web localStorage failed for ${key}:`, err);
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (err) {
      console.error(`[secureStorage] Error storing ${key}:`, err);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {
        return null;
      }
      return null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error(`[secureStorage] Error reading ${key}:`, err);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // ignore web cleanup error
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      console.error(`[secureStorage] Error deleting ${key}:`, err);
    }
  },
};

/**
 * Token Storage Service for Enterprise-Grade Credential Management
 */
export const tokenStorage = {
  /**
   * Initializes token cache on app startup from hardware keystore/keychain
   */
  async init(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    if (isInitialized) {
      return { accessToken: cachedAccessToken, refreshToken: cachedRefreshToken };
    }

    const [access, refresh] = await Promise.all([
      secureStorage.getItem(ACCESS_TOKEN_KEY),
      secureStorage.getItem(REFRESH_TOKEN_KEY),
    ]);

    cachedAccessToken = access;
    cachedRefreshToken = refresh;
    isInitialized = true;

    return { accessToken: cachedAccessToken, refreshToken: cachedRefreshToken };
  },

  /**
   * Synchronously retrieves the cached access token
   * Guarantees zero latency overhead on outgoing HTTP request headers
   */
  getAccessToken(): string | null {
    return cachedAccessToken;
  },

  /**
   * Synchronously retrieves the cached refresh token
   */
  getRefreshToken(): string | null {
    return cachedRefreshToken;
  },

  /**
   * Asynchronously saves tokens to both hardware-backed storage and in-memory cache
   */
  async setTokens(accessToken: string, refreshToken?: string | null): Promise<void> {
    cachedAccessToken = accessToken;
    const promises: Promise<void>[] = [secureStorage.setItem(ACCESS_TOKEN_KEY, accessToken)];

    if (refreshToken !== undefined && refreshToken !== null) {
      cachedRefreshToken = refreshToken;
      promises.push(secureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
    }

    await Promise.all(promises);
  },

  /**
   * Stores temporary pre-auth token (used during 2-step PIN login)
   */
  async setPreAuthToken(token: string | null): Promise<void> {
    if (token) {
      await secureStorage.setItem(PRE_AUTH_TOKEN_KEY, token);
    } else {
      await secureStorage.deleteItem(PRE_AUTH_TOKEN_KEY);
    }
  },

  /**
   * Retrieves temporary pre-auth token
   */
  async getPreAuthToken(): Promise<string | null> {
    return secureStorage.getItem(PRE_AUTH_TOKEN_KEY);
  },

  /**
   * Securely purges all user credentials upon logout or invalid session
   */
  async clearAll(): Promise<void> {
    cachedAccessToken = null;
    cachedRefreshToken = null;

    await Promise.all([
      secureStorage.deleteItem(ACCESS_TOKEN_KEY),
      secureStorage.deleteItem(REFRESH_TOKEN_KEY),
      secureStorage.deleteItem(PRE_AUTH_TOKEN_KEY),
    ]);
  },
};
