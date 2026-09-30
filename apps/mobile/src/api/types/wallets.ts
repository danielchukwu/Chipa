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

export interface AccountBankDetails {
  account_name: string;
  account_number: string;
  bank_name: string;
  routing_number?: string;
  sort_code?: string;
  iban?: string;
  bic?: string;
  deposit_address?: string;
}

export interface SupportedRail {
  name: string;
  settlement_time: string;
  fee: string;
}

export interface UserAccount {
  id: string;
  type: string;
  currency: SupportedCurrency;
  currency_name: string;
  currency_symbol: string;
  balance: number;
  balance_minor: number;
  available_balance: number;
  pending_balance: number;
  status: string;
  provider: string;
  bank_details: AccountBankDetails;
  supported_rails: SupportedRail[];
  created_at: string;
}

export interface AccountsSummary {
  total_balance_usd_equivalent: number;
  base_currency: string;
}

export interface GetWalletsResponse {
  summary?: AccountsSummary;
  accounts?: UserAccount[];
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
