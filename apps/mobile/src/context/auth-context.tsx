import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { chipaApi, clearAuthTokens, onSessionExpired, tokenStorage } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CurrencyBalance {
  /** ISO-4217 currency code */
  currency: string;
  /** Formatted balance string (e.g. "202,800.00") */
  balance: string;
  /** Flag emoji */
  flag: string;
  /** Symbol (e.g. "₦", "$", "£") */
  symbol: string;
}

export interface RecentTransaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  /** True if inflow (credit), false if outflow */
  isCredit: boolean;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountNumber: string;
  avatarInitials: string;
  totalBalance: string;
  totalBalanceCurrency: string;
  balances: CurrencyBalance[];
  recentTransactions: RecentTransaction[];
}

export interface PreAuthData {
  preAuthToken: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthContextType {
  /** Null when not authenticated */
  user: AuthUser | null;
  isAuthenticated: boolean;
  preAuthData: PreAuthData | null;
  /** Credentials captured on Screen 1; passed to Screen 2 for completion */
  loginForm: LoginFormData;
  updateLoginForm: <K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K],
  ) => void;
  /**
   * Phase 1: Validate email & password, receives preAuthToken
   */
  validateCredentials: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; user?: any }>;
  /**
   * Phase 2: Validate 4-digit PIN using preAuthToken and complete session
   */
  loginWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string, pin: string) => Promise<boolean>;
  register: (data?: { firstName?: string; lastName?: string; email?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Mock data — matches Screenshots 3-5
// ---------------------------------------------------------------------------

const MOCK_USER: AuthUser = {
  id: 'usr_001',
  firstName: 'Daniel',
  lastName: 'Chukwu',
  email: 'daniel@chipa.com',
  accountNumber: '9031420494',
  avatarInitials: 'DC',
  totalBalance: '2,800.00',
  totalBalanceCurrency: '₦',
  balances: [
    { currency: 'NGN', balance: '202,800.00', flag: '🇳🇬', symbol: '₦' },
    { currency: 'USD', balance: '0.00', flag: '🇺🇸', symbol: '$' },
    { currency: 'GBP', balance: '45.00', flag: '🇬🇧', symbol: '£' },
  ],
  recentTransactions: [
    {
      id: 'txn_001',
      description: 'Transfer from Mathew Ikechukwu',
      date: 'Feb 28, 2026',
      amount: '+₦5,245.83',
      isCredit: true,
    },
    {
      id: 'txn_002',
      description: 'Transfer to Uche Eze',
      date: 'Feb 28, 2026',
      amount: '₦5,245.83',
      isCredit: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialLoginForm: LoginFormData = { email: '', password: '' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginForm, setLoginForm] = useState<LoginFormData>(initialLoginForm);
  const [preAuthData, setPreAuthData] = useState<PreAuthData | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Initialize tokens from hardware secure store on app startup
    (async () => {
      try {
        const { accessToken } = await tokenStorage.init();
        if (accessToken && isMounted) {
          const profile = await chipaApi.getMe();
          if (profile && isMounted) {
            setUser({
              ...MOCK_USER,
              id: String(profile.id || 'usr_001'),
              firstName: profile.first_name || profile.firstName || 'Daniel',
              lastName: profile.last_name || profile.lastName || 'Chukwu',
              email: profile.email || 'daniel@chipa.com',
              accountNumber: profile.bank_account_number || MOCK_USER.accountNumber,
              avatarInitials: `${(profile.first_name?.[0] || profile.firstName?.[0] || 'D')}${(profile.last_name?.[0] || profile.lastName?.[0] || 'C')}`.toUpperCase(),
            });
          }
        }
      } catch {
        // Silent fallback for offline / unauthenticated states
      }
    })();

    // 2. Listen for session expiry event triggered by 401 token refresh failure
    const unsubscribe = onSessionExpired(() => {
      if (isMounted) {
        setUser(null);
        setPreAuthData(null);
        setLoginForm(initialLoginForm);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateLoginForm = useCallback(
    <K extends keyof LoginFormData>(field: K, value: LoginFormData[K]) => {
      setLoginForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const validateCredentials = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string; user?: any }> => {
      try {
        const res = await chipaApi.loginCredentials({ email, password });
        if (res?.preAuthToken) {
          setPreAuthData({
            preAuthToken: res.preAuthToken,
            firstName: res.user?.firstName || '',
            lastName: res.user?.lastName || '',
            email: res.user?.email || email,
            avatar: res.user?.avatar || '',
          });
          return { success: true, user: res.user };
        }
        return { success: false, error: 'Unexpected response from server' };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Invalid email or password',
        };
      }
    },
    [],
  );

  const loginWithPin = useCallback(
    async (pin: string): Promise<{ success: boolean; error?: string }> => {
      if (!preAuthData?.preAuthToken) {
        return { success: false, error: 'Login session expired. Please start over.' };
      }

      try {
        const res = await chipaApi.loginPin({
          preAuthToken: preAuthData.preAuthToken,
          pin,
        });

        if (res?.user) {
          setUser({
            ...MOCK_USER,
            id: String(res.user.id || 'usr_001'),
            firstName: res.user.first_name || preAuthData.firstName || 'Daniel',
            lastName: res.user.last_name || preAuthData.lastName || 'Chukwu',
            email: res.user.email || loginForm.email,
            accountNumber: res.user.bank_account_number || MOCK_USER.accountNumber,
            avatarInitials: `${(res.user.first_name?.[0] || preAuthData.firstName?.[0] || 'D')}${(res.user.last_name?.[0] || preAuthData.lastName?.[0] || 'C')}`.toUpperCase(),
          });
          setPreAuthData(null);
          setLoginForm(initialLoginForm);
          return { success: true };
        }
        return { success: false, error: 'Failed to complete login' };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Incorrect PIN. Please try again.',
        };
      }
    },
    [preAuthData, loginForm.email],
  );

  const login = useCallback(
    async (email: string, password: string, pin: string): Promise<boolean> => {
      try {
        const res = await chipaApi.login({ email, password, pin });
        if (res?.user) {
          setUser({
            ...MOCK_USER,
            id: String(res.user.id || 'usr_001'),
            firstName: res.user.first_name || 'Daniel',
            lastName: res.user.last_name || 'Chukwu',
            email: res.user.email || email,
            accountNumber: res.user.bank_account_number || MOCK_USER.accountNumber,
            avatarInitials: `${(res.user.first_name?.[0] || 'D')}${(res.user.last_name?.[0] || 'C')}`.toUpperCase(),
          });
          return true;
        }
      } catch {
        // Fallback gracefully for offline dev / preview
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setUser(MOCK_USER);
      return true;
    },
    [],
  );

  const register = useCallback(
    async (regData?: { firstName?: string; lastName?: string; email?: string }): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUser({
        ...MOCK_USER,
        firstName: regData?.firstName || 'Daniel',
        lastName: regData?.lastName || 'Chukwu',
        email: regData?.email || 'daniel@chipa.com',
        avatarInitials: `${(regData?.firstName?.[0] || 'D')}${(regData?.lastName?.[0] || 'C')}`.toUpperCase(),
      });
      return true;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await chipaApi.logout();
    } catch {
      // Ensure tokens are always cleared even if backend call fails
      clearAuthTokens();
    }
    setUser(null);
    setPreAuthData(null);
    setLoginForm(initialLoginForm);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        preAuthData,
        loginForm,
        updateLoginForm,
        validateCredentials,
        loginWithPin,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
