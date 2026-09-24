import { apiClient } from '../client';
import { tokenStorage } from '../storage';
import {
  ApiResponse,
  SendEmailOTPRequest,
  SendEmailOTPResponse,
  VerifyEmailOTPRequest,
  VerifyEmailOTPResponse,
  SignupRequest,
  SignupResponse,
  SendPhoneOTPRequest,
  VerifyPhoneOTPRequest,
  SavePhoneNumberRequest,
  SaveOnboardingProfileRequest,
  LoginCredentialsRequest,
  LoginCredentialsResponse,
  LoginPinRequest,
  LoginResponse,
  UserProfile,
  ForgotPasswordOTPResponse,
  ChangePasswordByEmailRequest,
} from '../types';

export const authService = {
  /**
   * Phase 1: Send OTP to prospective user's email
   */
  async sendSignupEmailOTP(email: string): Promise<SendEmailOTPResponse> {
    const res = await apiClient.post<ApiResponse<SendEmailOTPResponse>>(
      '/api/v1/auth/signup/email-otp',
      { email: email.trim().toLowerCase() } as SendEmailOTPRequest,
      { requiresAuth: false }
    );
    return res.data.data || (res.data as unknown as SendEmailOTPResponse);
  },

  /**
   * Phase 1: Verify email OTP
   */
  async verifySignupEmailOTP(email: string, otp: string): Promise<VerifyEmailOTPResponse> {
    const res = await apiClient.post<ApiResponse<VerifyEmailOTPResponse>>(
      '/api/v1/auth/signup/email-otp/verify',
      { email: email.trim().toLowerCase(), otp: otp.trim() } as VerifyEmailOTPRequest,
      { requiresAuth: false }
    );
    return res.data.data || (res.data as unknown as VerifyEmailOTPResponse);
  },

  /**
   * Phase 2: Sign up with country, password, and verification code
   */
  async signup(payload: SignupRequest): Promise<SignupResponse> {
    const res = await apiClient.post<ApiResponse<SignupResponse>>(
      '/api/v1/auth/signup',
      {
        ...payload,
        email: payload.email.trim().toLowerCase(),
      },
      { requiresAuth: false }
    );
    const data = res.data.data || (res.data as unknown as SignupResponse);
    if (data.accessToken) {
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
    }
    return data;
  },

  /**
   * Phase 3: Phone verification
   */
  async sendPhoneOTP(payload: SendPhoneOTPRequest): Promise<{ message?: string }> {
    const res = await apiClient.post<ApiResponse<{ message?: string }>>(
      '/api/v1/users/phone/otp',
      payload
    );
    return res.data.data || { message: res.data.message };
  },

  async verifyPhoneOTP(payload: VerifyPhoneOTPRequest): Promise<{ verified: boolean }> {
    const res = await apiClient.post<ApiResponse<{ verified: boolean }>>(
      '/api/v1/users/phone/verify',
      payload
    );
    return res.data.data || { verified: true };
  },

  /**
   * Save phone number without OTP verification (deferred verification)
   */
  async savePhoneNumber(payload: SavePhoneNumberRequest): Promise<{ saved: boolean }> {
    const res = await apiClient.post<ApiResponse<{ saved: boolean }>>(
      '/api/v1/users/phone',
      payload
    );
    return res.data.data || { saved: true };
  },

  /**
   * Phase 4: Save user onboarding profile
   */
  async saveOnboardingProfile(payload: SaveOnboardingProfileRequest): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(
      '/api/v1/users/me/onboarding',
      payload
    );
    return res.data.data || (res.data as unknown as UserProfile);
  },

  /**
   * Phase 5: Set 4-digit transaction PIN
   */
  async setTransactionPIN(pin: string): Promise<{ success: boolean }> {
    const res = await apiClient.post<ApiResponse<{ success: boolean }>>(
      '/api/v1/users/pin/set',
      { pin }
    );
    return res.data.data || { success: true };
  },

  /**
   * Login Step 1: Validate email + password credentials, receive preAuthToken
   */
  async loginCredentials(payload: LoginCredentialsRequest): Promise<LoginCredentialsResponse> {
    const res = await apiClient.post<ApiResponse<LoginCredentialsResponse>>(
      '/api/v1/auth/login',
      {
        identifierType: 'email',
        identifier: payload.email.trim().toLowerCase(),
        password: payload.password,
      },
      { requiresAuth: false }
    );
    const data = res.data.data || (res.data as unknown as LoginCredentialsResponse);
    if (data.preAuthToken) {
      await tokenStorage.setPreAuthToken(data.preAuthToken);
    }
    return data;
  },

  /**
   * Login Step 2: Validate 4-digit PIN with preAuthToken
   */
  async loginPin(payload: LoginPinRequest): Promise<LoginResponse> {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/login/pin',
      payload,
      { requiresAuth: false }
    );
    const data = res.data.data || (res.data as unknown as LoginResponse);
    if (data.accessToken) {
      await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      await tokenStorage.setPreAuthToken(null);
    }
    return data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/api/v1/users/me');
    return res.data.data || (res.data as unknown as UserProfile);
  },

  /**
   * Logout and invalidate backend session & local secure store
   */
  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken }, { requiresAuth: false });
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      await tokenStorage.clearAll();
    }
  },

  /**
   * Send OTP for forgot password recovery
   */
  async sendForgotPasswordOTP(email: string): Promise<ForgotPasswordOTPResponse> {
    const res = await apiClient.post<ApiResponse<ForgotPasswordOTPResponse>>(
      '/api/v1/auth/forgot-password/email-otp',
      { email: email.trim().toLowerCase() },
      { requiresAuth: false }
    );
    return res.data.data || (res.data as unknown as ForgotPasswordOTPResponse);
  },

  /**
   * Reset password with email + 6-digit OTP
   */
  async changePasswordByEmail(
    payload: ChangePasswordByEmailRequest
  ): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/api/v1/auth/change_password_by_email',
      {
        email: payload.email.trim().toLowerCase(),
        otp: payload.otp.trim(),
        password: payload.password,
      },
      { requiresAuth: false }
    );
    return { success: true, message: res.data.message };
  },
};
