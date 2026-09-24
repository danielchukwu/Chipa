import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fxService } from '../services/fx.service';
import { CreateQuoteRequest, ExecuteSwapRequest } from '../types';
import { walletKeys } from './use-wallets';

export const fxKeys = {
  all: ['fx'] as const,
  rates: () => [...fxKeys.all, 'rates'] as const,
};

/**
 * Hook to fetch live FX rates (auto-refreshes every 30 seconds)
 */
export function useFxRates() {
  return useQuery({
    queryKey: fxKeys.rates(),
    queryFn: () => fxService.getRates(),
    refetchInterval: 30000, // 30s auto poll for live rates
  });
}

/**
 * Hook to generate an exchange quote (valid for 60 seconds)
 */
export function useCreateQuoteMutation() {
  return useMutation({
    mutationFn: (payload: CreateQuoteRequest) => fxService.createQuote(payload),
  });
}

/**
 * Hook to execute a currency swap
 */
export function useExecuteSwapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExecuteSwapRequest) => fxService.executeSwap(payload),
    onSuccess: () => {
      // Invalidate wallets and transactions immediately after currency exchange
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: ['ledger-transactions'] });
    },
  });
}
