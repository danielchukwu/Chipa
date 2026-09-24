export interface SendEmailOTPRequest {
  email: string;
}

export interface SendEmailOTPResponse {
  emailVerificationToken?: string;
  expiresInSeconds?: number;
}

export interface VerifyEmailOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailOTPResponse {
  emailVerificationToken: string;
  expiresInSeconds: number;
}

export interface SignupRequest {
  countryId: number;
  email: string;
  password: string;
  verificationCode: string;
}

export interface SignupResponse {
  id: number;
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  preferences?: any;
}

export interface SendPhoneOTPRequest {
  phoneNumber: string;
  channel: 'sms' | 'whatsapp';
  iso2?: string;
}

export interface VerifyPhoneOTPRequest {
  phoneNumber: string;
  otp: string;
  iso2?: string;
}

export interface SavePhoneNumberRequest {
  phoneNumber: string;
  iso2?: string;
}

export interface SaveOnboardingProfileRequest {
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
}

export interface LoginCredentialsRequest {
  email: string;
  password: string;
}

export interface LoginCredentialsResponse {
  preAuthToken: string;
  requiresPin: boolean;
  user: {
    id?: string | number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    avatarInitials?: string;
  };
}

export interface LoginPinRequest {
  preAuthToken: string;
  pin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  preferences?: any;
}

export interface UserProfile {
  id: string | number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone_number?: string;
  phoneNumber?: string;
  avatar?: string;
  bank_account_number?: string;
  accountNumber?: string;
  tier?: number;
  is_verified?: boolean;
}

export interface ForgotPasswordOTPRequest {
  email: string;
}

export interface ForgotPasswordOTPResponse {
  message?: string;
  expiresInSeconds?: number;
}

export interface ChangePasswordByEmailRequest {
  email: string;
  otp: string;
  password: string;
}

