import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardsService } from '../services/cards.service';
import { CreateCardRequest, FundCardRequest } from '../types';
import { walletKeys } from './use-wallets';

export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  detail: (id: string) => [...cardKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all user cards (virtual & physical)
 */
export function useCards() {
  return useQuery({
    queryKey: cardKeys.lists(),
    queryFn: () => cardsService.listCards(),
  });
}

/**
 * Hook to fetch detailed card info (PAN, CVV, billing address)
 */
export function useCardDetails(cardId: string, enabled = true) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => cardsService.getCardDetails(cardId),
    enabled: Boolean(cardId) && enabled,
  });
}

/**
 * Hook to issue a new virtual or physical card
 */
export function useCreateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCardRequest) => cardsService.createCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

/**
 * Hook to freeze a card
 */
export function useFreezeCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => cardsService.freezeCard(cardId),
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

/**
 * Hook to unfreeze a card
 */
export function useUnfreezeCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => cardsService.unfreezeCard(cardId),
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

/**
 * Hook to fund a card from account balance
 */
export function useFundCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: FundCardRequest }) =>
      cardsService.fundCard(cardId, payload),
    onSuccess: (_, { cardId }) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: ['ledger-transactions'] });
    },
  });
}
