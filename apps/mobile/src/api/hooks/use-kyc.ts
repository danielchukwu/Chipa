import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kycService } from '../services/kyc.service';
import { SubmitTier1Request, SubmitTier2Request, SubmitTier3Request } from '../types';

export const kycKeys = {
  all: ['kyc'] as const,
  status: () => [...kycKeys.all, 'status'] as const,
};

/**
 * Hook to fetch KYC status and verification tiers
 */
export function useKYCStatus() {
  return useQuery({
    queryKey: kycKeys.status(),
    queryFn: () => kycService.getKYCStatus(),
  });
}

/**
 * Hook to submit Tier 1 identity verification (BVN, NIN, etc.)
 */
export function useSubmitTier1Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitTier1Request) => kycService.submitTier1(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
}

/**
 * Hook to submit Tier 2 address verification
 */
export function useSubmitTier2Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitTier2Request) => kycService.submitTier2(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
}

/**
 * Hook to submit Tier 3 source of funds verification
 */
export function useSubmitTier3Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitTier3Request) => kycService.submitTier3(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kycKeys.all });
    },
  });
}
