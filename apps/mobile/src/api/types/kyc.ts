export interface KYCStatus {
  tier: number;
  status: 'pending' | 'verified' | 'rejected' | 'unverified';
  dailyLimit: number;
  monthlyLimit: number;
  unlockedFeatures: string[];
  pendingDocuments?: string[];
  rejectionReason?: string;
}

export interface GetKYCStatusResponse {
  kyc: KYCStatus;
}

export interface SubmitTier1Request {
  country_code?: string;
  document_type?: string;
  id_number?: string;
  bvn?: string;
  nin?: string;
}

export interface SubmitTier2Request {
  utilityBillUrl?: string;
  proofOfAddressUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface SubmitTier3Request {
  sourceOfFunds?: string;
  estimatedMonthlyVolume?: number;
  bankStatementUrl?: string;
}
