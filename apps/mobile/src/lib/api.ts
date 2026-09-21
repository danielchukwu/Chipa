import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// API Configuration & Base URL
// ---------------------------------------------------------------------------

const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  // Android emulator connects to host machine via 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4100';
  }
  // iOS simulator and Web connect directly via localhost
  return 'http://localhost:4100';
};

export const API_BASE_URL = getApiBaseUrl();

// ---------------------------------------------------------------------------
// Token Management (In-Memory with Context Sync)
// ---------------------------------------------------------------------------

let activeAccessToken: string | null = null;
let activeRefreshToken: string | null = null;

export const setAuthTokens = (access: string | null, refresh: string | null = null) => {
  activeAccessToken = access;
  if (refresh !== undefined) {
    activeRefreshToken = refresh;
  }
};

export const getAccessToken = (): string | null => activeAccessToken;
export const getRefreshToken = (): string | null => activeRefreshToken;

export const clearAuthTokens = () => {
  activeAccessToken = null;
  activeRefreshToken = null;
};

// ---------------------------------------------------------------------------
// Generic HTTP Fetch Client
// ---------------------------------------------------------------------------

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

export interface ApiResponse<T = any> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (activeAccessToken && options.requiresAuth !== false) {
    headers['Authorization'] = `Bearer ${activeAccessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        json?.message || json?.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    // Backend returns standard response shape { status, message, data }
    return json?.data !== undefined ? json.data : (json as T);
  } catch (err: any) {
    // If it's a TypeError from fetch (network error), provide a friendly explanation
    if (err.name === 'TypeError' && err.message?.includes('Network request failed')) {
      throw new Error(`Unable to connect to server at ${API_BASE_URL}. Please ensure the Chipa API is running.`);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// API Methods for Progressive Onboarding
// ---------------------------------------------------------------------------

export const chipaApi = {
  // 1. Email OTP
  sendSignupEmailOTP: async (email: string): Promise<{ emailVerificationToken?: string; expiresInSeconds?: number }> => {
    return request('/api/v1/auth/signup/email-otp', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      requiresAuth: false,
    });
  },

  verifySignupEmailOTP: async (
    email: string,
    otp: string,
  ): Promise<{ emailVerificationToken: string; expiresInSeconds: number }> => {
    return request('/api/v1/auth/signup/email-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      requiresAuth: false,
    });
  },

  // 2. Initial Account Creation (Phase 1)
  signup: async (payload: {
    countryId: number;
    email: string;
    password: string;
    verificationCode: string;
  }): Promise<{
    id: number;
    accessToken: string;
    refreshToken: string;
    user: any;
    preferences?: any;
  }> => {
    const data = await request<{
      id: number;
      accessToken: string;
      refreshToken: string;
      user: any;
      preferences?: any;
    }>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        countryId: payload.countryId,
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        verificationCode: payload.verificationCode,
      }),
      requiresAuth: false,
    });

    if (data?.accessToken) {
      setAuthTokens(data.accessToken, data.refreshToken);
    }

    return data;
  },

  // 3. Phone OTP
  sendPhoneOTP: async (payload: {
    phoneNumber: string;
    channel: 'sms' | 'whatsapp';
    iso2?: string;
  }): Promise<{ message?: string }> => {
    return request('/api/v1/users/phone/otp', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: payload.phoneNumber.trim(),
        channel: payload.channel,
        iso2: payload.iso2 || 'NG',
      }),
    });
  },

  verifyPhoneOTP: async (payload: {
    phoneNumber: string;
    otp: string;
    iso2?: string;
  }): Promise<{ verified: boolean }> => {
    return request('/api/v1/users/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: payload.phoneNumber.trim(),
        otp: payload.otp.trim(),
        iso2: payload.iso2 || 'NG',
      }),
    });
  },

  // 4. Personal Information & Home Address
  saveOnboardingProfile: async (payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dob: string;
    countryCode?: string;
    currentCountry?: number;
    state?: string;
    city?: string;
    streetAddress?: string;
    postalCode?: string;
    referralSource?: string;
    referralCode?: string;
  }): Promise<any> => {
    return request('/api/v1/users/me/onboarding', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: payload.firstName.trim(),
        middleName: payload.middleName?.trim() || '',
        lastName: payload.lastName.trim(),
        dateOfBirth: payload.dob,
        countryCode: payload.countryCode || 'NG',
        countryId: payload.currentCountry,
        state: payload.state || '',
        city: payload.city || '',
        streetAddress: payload.streetAddress || '',
        postalCode: payload.postalCode || '',
        referralSource: payload.referralSource || '',
        referralCode: payload.referralCode || '',
      }),
    });
  },

  // 5. Transaction PIN
  setTransactionPIN: async (pin: string): Promise<any> => {
    return request('/api/v1/users/pin/set', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  // 6. Two-Step Login Flow
  loginCredentials: async (payload: {
    email: string;
    password: string;
  }): Promise<{
    preAuthToken: string;
    requiresPin: boolean;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      avatar: string;
    };
  }> => {
    return request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifierType: 'email',
        identifier: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
      requiresAuth: false,
    });
  },

  loginPin: async (payload: {
    preAuthToken: string;
    pin: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
    preferences: any;
  }> => {
    const data = await request<any>('/api/v1/auth/login/pin', {
      method: 'POST',
      body: JSON.stringify({
        preAuthToken: payload.preAuthToken,
        pin: payload.pin,
      }),
      requiresAuth: false,
    });

    if (data?.accessToken) {
      setAuthTokens(data.accessToken, data.refreshToken);
    }

    return data;
  },

  login: async (payload: {
    email: string;
    password: string;
    pin?: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
    preferences: any;
  }> => {
    // Step 1: Validate credentials
    const creds = await chipaApi.loginCredentials({
      email: payload.email,
      password: payload.password,
    });

    // Step 2: Validate PIN if provided
    if (payload.pin && creds?.preAuthToken) {
      return chipaApi.loginPin({
        preAuthToken: creds.preAuthToken,
        pin: payload.pin,
      });
    }

    return creds as any;
  },

  // 8. User Profile & Wallets
  getMe: async (): Promise<any> => {
    return request('/api/v1/users/me');
  },

  getWallets: async (): Promise<any[]> => {
    return request('/api/v1/wallets');
  },
};
