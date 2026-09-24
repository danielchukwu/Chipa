import { apiClient } from '../client';
import {
  ApiResponse,
  VASCategory,
  VASOperator,
  ValidateRecipientRequest,
  ValidateRecipientResponse,
  PayBillRequest,
  PayBillResponse,
  BillReceipt,
} from '../types';

export const vasService = {
  /**
   * Get supported bill categories (airtime, data, electricity, cable_tv)
   */
  async getCategories(): Promise<VASCategory[]> {
    const res = await apiClient.get<ApiResponse<{ categories: VASCategory[] }>>(
      '/api/v1/bills/categories',
      { requiresAuth: false }
    );
    return res.data.data?.categories || [];
  },

  /**
   * Get billers/operators for a given category
   */
  async getOperators(category: VASCategory): Promise<VASOperator[]> {
    const res = await apiClient.get<ApiResponse<{ operators: VASOperator[] }>>(
      '/api/v1/bills/operators',
      {
        params: { category },
        requiresAuth: false,
      }
    );
    return res.data.data?.operators || [];
  },

  /**
   * Validate recipient details (e.g. electricity meter or smartcard number)
   */
  async validateRecipient(
    payload: ValidateRecipientRequest
  ): Promise<ValidateRecipientResponse['validation']> {
    const res = await apiClient.post<ApiResponse<ValidateRecipientResponse>>(
      '/api/v1/bills/validate',
      payload
    );
    if (!res.data.data?.validation) {
      throw new Error('Failed to validate recipient');
    }
    return res.data.data.validation;
  },

  /**
   * Pay a bill or purchase airtime/data
   */
  async payBill(payload: PayBillRequest): Promise<BillReceipt> {
    const res = await apiClient.post<ApiResponse<PayBillResponse>>('/api/v1/bills/pay', payload);
    if (!res.data.data?.receipt) {
      throw new Error('Failed to process bill payment');
    }
    return res.data.data.receipt;
  },
};
