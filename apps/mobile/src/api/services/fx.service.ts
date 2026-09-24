import { apiClient } from '../client';
import {
  ApiResponse,
  FXRatesResponse,
  CreateQuoteRequest,
  CreateQuoteResponse,
  ExecuteSwapRequest,
  ExecuteSwapResponse,
  FXQuote,
} from '../types';

export const fxService = {
  /**
   * Get live market rates for all supported pairs
   */
  async getRates(): Promise<FXRatesResponse['rates']> {
    const res = await apiClient.get<ApiResponse<FXRatesResponse>>('/api/v1/fx/rates', {
      requiresAuth: false,
    });
    return res.data.data?.rates || {};
  },

  /**
   * Request a guaranteed FX quote valid for 60 seconds
   */
  async createQuote(payload: CreateQuoteRequest): Promise<FXQuote> {
    const res = await apiClient.post<ApiResponse<CreateQuoteResponse>>(
      '/api/v1/fx/quote',
      payload
    );
    if (!res.data.data?.quote) {
      throw new Error('Failed to create FX quote');
    }
    return res.data.data.quote;
  },

  /**
   * Execute an FX swap with transaction PIN
   */
  async executeSwap(payload: ExecuteSwapRequest): Promise<ExecuteSwapResponse['swap']> {
    const res = await apiClient.post<ApiResponse<ExecuteSwapResponse>>(
      '/api/v1/fx/swap',
      payload
    );
    if (!res.data.data?.swap) {
      throw new Error('Failed to execute FX swap');
    }
    return res.data.data.swap;
  },
};
