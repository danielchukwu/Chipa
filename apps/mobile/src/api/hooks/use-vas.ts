import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vasService } from '../services/vas.service';
import { VASCategory, ValidateRecipientRequest, PayBillRequest } from '../types';
import { walletKeys } from './use-wallets';

export const vasKeys = {
  all: ['vas'] as const,
  categories: () => [...vasKeys.all, 'categories'] as const,
  operators: (category: VASCategory) => [...vasKeys.all, 'operators', category] as const,
};

/**
 * Hook to fetch bill categories
 */
export function useVASCategories() {
  return useQuery({
    queryKey: vasKeys.categories(),
    queryFn: () => vasService.getCategories(),
  });
}

/**
 * Hook to fetch billers/operators for a given category
 */
export function useVASOperators(category: VASCategory) {
  return useQuery({
    queryKey: vasKeys.operators(category),
    queryFn: () => vasService.getOperators(category),
    enabled: Boolean(category),
  });
}

/**
 * Hook to validate recipient (meter number or smartcard)
 */
export function useValidateRecipientMutation() {
  return useMutation({
    mutationFn: (payload: ValidateRecipientRequest) => vasService.validateRecipient(payload),
  });
}

/**
 * Hook to pay a bill / purchase airtime/data
 */
export function usePayBillMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PayBillRequest) => vasService.payBill(payload),
    onSuccess: () => {
      // Invalidate wallets and transactions immediately after bill payment
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: ['ledger-transactions'] });
    },
  });
}
