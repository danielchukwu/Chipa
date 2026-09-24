export type VASCategory = 'airtime' | 'data' | 'electricity' | 'cable_tv';

export interface VASOperator {
  id: string;
  name: string;
  code: string;
  category: VASCategory;
  logo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ValidateRecipientRequest {
  category: VASCategory;
  operator: string;
  recipient: string;
}

export interface ValidateRecipientResponse {
  validation: {
    isValid: boolean;
    customerName?: string;
    accountNumber?: string;
    address?: string;
  };
}

export interface PayBillRequest {
  category: VASCategory;
  operator: string;
  recipient: string;
  amount: number;
  pin: string;
}

export interface BillReceipt {
  reference: string;
  category: VASCategory;
  operator: string;
  recipient: string;
  amount: number;
  token?: string; // e.g. prepaid electricity token
  units?: string;
  status: 'successful' | 'pending' | 'failed';
  createdAt: string;
}

export interface PayBillResponse {
  receipt: BillReceipt;
}
