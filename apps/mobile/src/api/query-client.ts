import { AppState, AppStateStatus, Platform } from 'react-native';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { ApiError } from './errors';

// ---------------------------------------------------------------------------
// Mobile Lifecycle: NetInfo (Online / Offline state manager)
// ---------------------------------------------------------------------------

// Automatically pauses queries when offline and resumes upon network reconnection
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    const isConnected = state.isConnected ?? true;
    const isInternetReachable = state.isInternetReachable ?? true;
    setOnline(Boolean(isConnected && isInternetReachable));
  });
});

// ---------------------------------------------------------------------------
// Mobile Lifecycle: AppState (Focus manager)
// ---------------------------------------------------------------------------

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

const appStateSubscription = AppState.addEventListener('change', onAppStateChange);

// ---------------------------------------------------------------------------
// Fintech QueryClient Factory & Instance
// ---------------------------------------------------------------------------

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 2 minutes before marking stale
      staleTime: 1000 * 60 * 2,
      // Retain inactive queries in cache for 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Mobile user experience: Refetch when returning to the app or regaining network
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Smart Retry Policy:
      // Do NOT retry client errors (400, 401, 403, 404, 422).
      // Retry transient network dropouts and 5xx up to 2 times with exponential backoff.
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;

        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },

    mutations: {
      // Financial transactions (transfers, FX swaps, card funding) must never automatically retry
      // to avoid inadvertent duplicate charges
      retry: 0,
    },
  },
});
