import { apiClient, API_BASE_URL } from '../api/client';
import { tokenStorage } from '../api/storage';
import { authService } from '../api/services/auth.service';
import { walletsService } from '../api/services/wallets.service';
import { kycService } from '../api/services/kyc.service';
import { parseApiError } from '../api/errors';

export { API_BASE_URL };
export * from '../api';

// ---------------------------------------------------------------------------
// Backwards-Compatible Token Management
// ---------------------------------------------------------------------------

export const setAuthTokens = (access: string | null, refresh: string | null = null) => {
  if (access) {
    tokenStorage.setTokens(access, refresh);
  } else {
    tokenStorage.clearAll();
  }
};

export const getAccessToken = (): string | null => tokenStorage.getAccessToken();
export const getRefreshToken = (): string | null => tokenStorage.getRefreshToken();

export const clearAuthTokens = () => {
  tokenStorage.clearAll();
};

// ---------------------------------------------------------------------------
// Backwards-Compatible Generic HTTP Request Helper
// ---------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function request<T = any>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
    idempotencyKey?: string;
  } = {}
): Promise<T> {
  try {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const method = (options.method || 'GET').toLowerCase();
    const data = options.body
      ? typeof options.body === 'string'
        ? JSON.parse(options.body)
        : options.body
      : undefined;

    const response = await apiClient.request<{
      status?: boolean;
      message?: string;
      data?: T;
      error?: string;
    }>({
      url,
      method,
      data,
      headers: options.headers,
      requiresAuth: options.requiresAuth,
      idempotencyKey: options.idempotencyKey,
    });

    const body = response.data;
    return body?.data !== undefined ? body.data : (body as unknown as T);
  } catch (err) {
    throw parseApiError(err);
  }
}

// ---------------------------------------------------------------------------
// Backwards-Compatible chipaApi Facade
// ---------------------------------------------------------------------------

export const chipaApi = {
  // 1. Email OTP
  sendSignupEmailOTP: (email: string) => authService.sendSignupEmailOTP(email),
  verifySignupEmailOTP: (email: string, otp: string) =>
    authService.verifySignupEmailOTP(email, otp),

  // 2. Initial Account Creation (Phase 1)
  signup: (payload: {
    countryId: number;
    email: string;
    password: string;
    verificationCode: string;
  }) => authService.signup(payload),

  // 3. Phone Handling
  sendPhoneOTP: (payload: { phoneNumber: string; channel: 'sms' | 'whatsapp'; iso2?: string }) =>
    authService.sendPhoneOTP(payload),
  verifyPhoneOTP: (payload: { phoneNumber: string; otp: string; iso2?: string }) =>
    authService.verifyPhoneOTP(payload),
  savePhoneNumber: (payload: { phoneNumber: string; iso2?: string }) =>
    authService.savePhoneNumber(payload),

  // 4. Personal Information & Home Address
  saveOnboardingProfile: (payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dob: string;
    countryCode?: string;
    currentCountry?: number;
    phoneNumber?: string;
    state?: string;
    city?: string;
    streetAddress?: string;
    postalCode?: string;
    referralSource?: string;
    referralCode?: string;
  }) => authService.saveOnboardingProfile(payload),

  // 5. Transaction PIN
  setTransactionPIN: (pin: string) => authService.setTransactionPIN(pin),

  // 6. Two-Step Login Flow
  loginCredentials: (payload: { email: string; password: string }) =>
    authService.loginCredentials(payload),
  loginPin: (payload: { preAuthToken: string; pin: string }) => authService.loginPin(payload),

  login: async (payload: { email: string; password: string; pin?: string }) => {
    const creds = await authService.loginCredentials({
      email: payload.email,
      password: payload.password,
    });

    if (payload.pin && creds?.preAuthToken) {
      return authService.loginPin({
        preAuthToken: creds.preAuthToken,
        pin: payload.pin,
      });
    }

    return creds as any;
  },

  // 7. User Profile & Wallets
  getMe: () => authService.getMe(),
  getWallets: () => walletsService.getWallets(),

  // 8. Forgot Password Flow
  sendForgotPasswordOTP: (email: string) =>
    authService.sendForgotPasswordOTP(email),
  changePasswordByEmail: (payload: { email: string; otp: string; password: string }) =>
    authService.changePasswordByEmail(payload),

  // 9. Logout
  logout: () => authService.logout(),

  // 10. KYC Identity Verification
  submitTier1: (payload: { bvn?: string; nin?: string; country_code?: string }) =>
    kycService.submitTier1(payload),
  getKYCStatus: () => kycService.getKYCStatus(),
};
