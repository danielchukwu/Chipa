import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface Country {
  id?: number;
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { id: 161, code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { id: 233, code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { id: 232, code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { id: 39, code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { id: 83, code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { id: 113, code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { id: 204, code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { id: 231, code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { id: 82, code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { id: 75, code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
];

export interface RegisterData {
  country: Country;
  email: string;
  otp: string;
  emailVerificationToken?: string;
  password: string;
  accessToken?: string;
  phoneNumber: string;
  verificationChannel: 'whatsapp' | 'sms';
  phoneOtp: string;
  phoneVerified?: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  referralSource: string;
  countryOfResidence: Country;
  state: string;
  streetAddress: string;
  city: string;
  postCode: string;
  pin: string;
  confirmPin: string;
  referralCode: string;
}

interface RegisterContextType {
  data: RegisterData;
  updateField: <K extends keyof RegisterData>(field: K, value: RegisterData[K]) => void;
  reset: () => void;
}

const defaultCountry = COUNTRIES[0];

const initialData: RegisterData = {
  country: defaultCountry,
  email: '',
  otp: '',
  emailVerificationToken: '',
  password: '',
  accessToken: '',
  phoneNumber: '',
  verificationChannel: 'whatsapp',
  phoneOtp: '',
  phoneVerified: false,
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  referralSource: '',
  countryOfResidence: defaultCountry,
  state: '',
  streetAddress: '',
  city: '',
  postCode: '',
  pin: '',
  confirmPin: '',
  referralCode: '',
};

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RegisterData>(initialData);

  const updateField = useCallback(<K extends keyof RegisterData>(field: K, value: RegisterData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
  }, []);

  const value = useMemo(
    () => ({ data, updateField, reset }),
    [data, updateField, reset]
  );

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return context;
}
