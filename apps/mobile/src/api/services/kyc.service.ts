import { apiClient } from '../client';
import {
  ApiResponse,
  KYCStatus,
  GetKYCStatusResponse,
  SubmitTier1Request,
  SubmitTier2Request,
  SubmitTier3Request,
} from '../types';

export const kycService = {
  /**
   * Get user KYC tier and status
   */
  async getKYCStatus(): Promise<KYCStatus> {
    const res = await apiClient.get<ApiResponse<GetKYCStatusResponse>>('/api/v1/kyc/status');
    if (!res.data.data?.kyc) {
      throw new Error('Failed to retrieve KYC status');
    }
    return res.data.data.kyc;
  },

  /**
   * Submit Tier 1 verification (BVN, NIN, etc.)
   */
  async submitTier1(payload: SubmitTier1Request): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/api/v1/kyc/tier1', payload);
    return res.data.data;
  },

  /**
   * Submit Tier 2 verification (Proof of address)
   */
  async submitTier2(payload: SubmitTier2Request): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/api/v1/kyc/tier2', payload);
    return res.data.data;
  },

  /**
   * Submit Tier 3 verification (Proof of funds)
   */
  async submitTier3(payload: SubmitTier3Request): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/api/v1/kyc/tier3', payload);
    return res.data.data;
  },
};
