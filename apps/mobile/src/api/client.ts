import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";
import { tokenStorage } from "./storage";
import { parseApiError } from "./errors";

// ---------------------------------------------------------------------------
// Base URL Resolution
// ---------------------------------------------------------------------------

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!envUrl) {
    throw new Error(
      "[Chipa] EXPO_PUBLIC_API_URL is not set. " +
        "Configure it in your .env.local (dev) or EAS environment variables (prod) before running the app.",
    );
  }

  // All other platforms (iOS, Android) — use the explicitly configured URL.
  // On physical devices running Expo Go / dev client, set EXPO_PUBLIC_API_URL
  // to your machine's LAN address (e.g. http://192.168.1.5:4100).
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// ---------------------------------------------------------------------------
// Extended Request Configuration
// ---------------------------------------------------------------------------

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Set to false to omit Authorization header even if access token is available */
    requiresAuth?: boolean;
    /** UUID or unique string to prevent duplicate execution of financial transactions */
    idempotencyKey?: string;
    /** Internal flag to avoid infinite refresh retry loops */
    _retry?: boolean;
  }
}

// ---------------------------------------------------------------------------
// Concurrency Mutex & Queue for Silent Token Refresh
// ---------------------------------------------------------------------------

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Global session expiry subscribers (e.g. AuthContext)
type SessionExpiredHandler = () => void;
const sessionExpiredHandlers = new Set<SessionExpiredHandler>();

export const onSessionExpired = (
  handler: SessionExpiredHandler,
): (() => void) => {
  sessionExpiredHandlers.add(handler);
  return () => sessionExpiredHandlers.delete(handler);
};

const notifySessionExpired = () => {
  sessionExpiredHandlers.forEach((handler) => {
    try {
      handler();
    } catch (e) {
      console.error("[notifySessionExpired] Handler error:", e);
    }
  });
};

// ---------------------------------------------------------------------------
// Axios Instance Configuration
// ---------------------------------------------------------------------------

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000, // 25s timeout for mobile networks
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Platform": Platform.OS,
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor: Auth & Idempotency Injection
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically ensure fresh baseURL for physical devices
    const currentBaseUrl = getApiBaseUrl();
    if (currentBaseUrl) {
      config.baseURL = currentBaseUrl;
    }

    if (__DEV__) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`,
      );
    }

    // 1. Inject Authorization header if requiresAuth is not explicitly false
    if (config.requiresAuth !== false) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // 2. Inject Idempotency-Key if provided in config
    if (config.idempotencyKey) {
      config.headers["Idempotency-Key"] = config.idempotencyKey;
    }

    return config;
  },
  (error) => Promise.reject(parseApiError(error)),
);

// ---------------------------------------------------------------------------
// Response Interceptor: 401 Silent Token Refresh Queue
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Ignore if not a 401 error or request config is missing
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(parseApiError(error));
    }

    // Do NOT attempt refresh for public or auth endpoints to avoid infinite loops
    const requestUrl = originalRequest.url || "";
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/forgot-password");

    if (isAuthRoute || originalRequest._retry) {
      if (requestUrl.includes("/auth/refresh")) {
        // Refresh token itself failed or expired! Force session termination
        await tokenStorage.clearAll();
        notifySessionExpired();
      }
      return Promise.reject(parseApiError(error));
    }

    // If another refresh request is already running, wait in queue
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(parseApiError(err)));
    }

    // Mark as retrying
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      await tokenStorage.clearAll();
      notifySessionExpired();
      return Promise.reject(parseApiError(error));
    }

    try {
      // Use raw axios to prevent interceptor recursion
      const refreshResponse = await axios.post<{
        status: boolean;
        message?: string;
        data: {
          accessToken: string;
          refreshToken?: string;
          user?: any;
        };
      }>(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
        refreshToken,
      });

      const data = refreshResponse.data?.data;
      if (!data?.accessToken) {
        throw new Error("Invalid refresh response payload");
      }

      // Persist rotated tokens
      await tokenStorage.setTokens(
        data.accessToken,
        data.refreshToken || refreshToken,
      );

      // Notify and replay queued requests
      processQueue(null, data.accessToken);

      // Replay the original failed request
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      await tokenStorage.clearAll();
      notifySessionExpired();
      return Promise.reject(parseApiError(refreshErr));
    } finally {
      isRefreshing = false;
    }
  },
);
