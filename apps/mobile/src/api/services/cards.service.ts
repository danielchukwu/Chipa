import { apiClient } from '../client';
import {
  ApiResponse,
  Card,
  CardDetails,
  CreateCardRequest,
  FundCardRequest,
  ListCardsResponse,
  CardResponse,
  CardDetailsResponse,
} from '../types';

export const cardsService = {
  /**
   * List all cards owned by the authenticated user
   */
  async listCards(): Promise<Card[]> {
    const res = await apiClient.get<ApiResponse<ListCardsResponse>>('/api/v1/cards');
    return res.data.data?.cards || [];
  },

  /**
   * Get card details including PAN, CVV, and billing address
   */
  async getCardDetails(cardId: string): Promise<CardDetails> {
    const res = await apiClient.get<ApiResponse<CardDetailsResponse>>(
      `/api/v1/cards/${cardId}/details`
    );
    if (!res.data.data?.card) {
      throw new Error('Card details not found');
    }
    return res.data.data.card;
  },

  /**
   * Issue a new virtual or physical card
   */
  async createCard(payload: CreateCardRequest): Promise<Card> {
    const res = await apiClient.post<ApiResponse<CardResponse>>('/api/v1/cards', payload);
    if (!res.data.data?.card) {
      throw new Error('Failed to create card');
    }
    return res.data.data.card;
  },

  /**
   * Freeze an active card
   */
  async freezeCard(cardId: string): Promise<void> {
    await apiClient.post(`/api/v1/cards/${cardId}/freeze`);
  },

  /**
   * Unfreeze a card
   */
  async unfreezeCard(cardId: string): Promise<void> {
    await apiClient.post(`/api/v1/cards/${cardId}/unfreeze`);
  },

  /**
   * Fund card from user's account balance
   */
  async fundCard(cardId: string, payload: FundCardRequest): Promise<void> {
    await apiClient.post(`/api/v1/cards/${cardId}/fund`, payload);
  },
};
