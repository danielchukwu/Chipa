import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletsService } from '../services/wallets.service';
import { SupportedCurrency, GetLedgerTransactionsParams } from '../types';

export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  detail: (currency: SupportedCurrency) => [...walletKeys.all, 'detail', currency] as const,
  ledger: (params?: GetLedgerTransactionsParams) => ['ledger-transactions', params] as const,
};

/**
 * Hook to fetch all user multi-currency wallets (NGN, USD, GBP, EUR)
 */
export function useWallets() {
  return useQuery({
    queryKey: walletKeys.lists(),
    queryFn: () => walletsService.getWallets(),
  });
}

/**
 * Hook to fetch a specific wallet by its currency code
 */
export function useWalletByCurrency(currency: SupportedCurrency) {
  return useQuery({
    queryKey: walletKeys.detail(currency),
    queryFn: () => walletsService.getWalletByCurrency(currency),
    enabled: Boolean(currency),
  });
}

/**
 * Hook to fetch double-entry ledger transactions
 */
export function useLedgerTransactions(params?: GetLedgerTransactionsParams) {
  return useQuery({
    queryKey: walletKeys.ledger(params),
    queryFn: () => walletsService.getLedgerTransactions(params),
  });
}

/**
 * Utility hook to programmatically invalidate wallet caches (e.g. after top-ups or transfers)
 */
export function useInvalidateWallets() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
    queryClient.invalidateQueries({ queryKey: ['ledger-transactions'] });
  };
}
