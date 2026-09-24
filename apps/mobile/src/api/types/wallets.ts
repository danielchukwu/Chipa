import { SupportedCurrency } from './common';

export interface Wallet {
  id: string | number;
  currency: SupportedCurrency;
  balance: string | number;
  formattedBalance?: string;
  flag?: string;
  symbol?: string;
  accountName?: string;
  account_name?: string;
  accountNumber?: string;
  account_number?: string;
  bankName?: string;
  bank_name?: string;
  routingNumber?: string;
  routing_number?: string;
  iban?: string;
  sortCode?: string;
  sort_code?: string;
  bic?: string;
  depositAddress?: string;
  deposit_address?: string;
  status?: 'active' | 'frozen' | 'pending';
  updatedAt?: string;
  updated_at?: string;
}

export interface LedgerTransaction {
  id: string;
  transactionRef: string;
  type: 'credit' | 'debit' | 'transfer' | 'exchange' | 'bill_payment' | 'card_funding';
  currency: SupportedCurrency;
  amount: string | number;
  formattedAmount?: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  recipientName?: string;
  senderName?: string;
  fee?: string | number;
  isCredit: boolean;
  createdAt: string;
}

export interface GetWalletsResponse {
  wallets: Wallet[];
}

export interface GetWalletResponse {
  wallet: Wallet;
}

export interface GetLedgerTransactionsResponse {
  transactions: LedgerTransaction[];
}

export interface GetLedgerTransactionsParams {
  limit?: number;
  offset?: number;
}
