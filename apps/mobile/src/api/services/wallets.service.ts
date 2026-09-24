import { apiClient } from '../client';
import {
  ApiResponse,
  SupportedCurrency,
  Wallet,
  LedgerTransaction,
  GetWalletsResponse,
  GetWalletResponse,
  GetLedgerTransactionsResponse,
  GetLedgerTransactionsParams,
} from '../types';

function normalizeWallet(w: any): Wallet {
  const accNum = w.account_number || w.accountNumber || '';
  const bank = w.bank_name || w.bankName || '';
  const accName = w.account_name || w.accountName || '';
  const bal =
    typeof w.balance === 'number'
      ? w.balance
      : typeof w.balance_minor === 'number'
      ? w.balance_minor / 100
      : Number(w.balance || 0);

  return {
    id: w.id,
    currency: w.currency,
    balance: bal,
    formattedBalance:
      w.formatted_balance ||
      w.formattedBalance ||
      `${w.symbol || ''}${bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    flag: w.flag,
    symbol: w.symbol,
    accountNumber: accNum,
    account_number: accNum,
    bankName: bank,
    bank_name: bank,
    accountName: accName,
    account_name: accName,
    routingNumber: w.routing_number || w.routingNumber,
    routing_number: w.routing_number || w.routingNumber,
    iban: w.iban,
    sortCode: w.sort_code || w.sortCode,
    sort_code: w.sort_code || w.sortCode,
    bic: w.bic,
    depositAddress: w.deposit_address || w.depositAddress,
    deposit_address: w.deposit_address || w.depositAddress,
    status: w.status,
    updatedAt: w.updated_at || w.updatedAt,
    updated_at: w.updated_at || w.updatedAt,
  };
}

export const walletsService = {
  /**
   * Fetch all user wallets across supported currencies (NGN, USD, GBP, EUR)
   */
  async getWallets(): Promise<Wallet[]> {
    const res = await apiClient.get<ApiResponse<GetWalletsResponse>>('/api/v1/wallets');
    const rawList = res.data.data?.wallets || [];
    return rawList.map(normalizeWallet);
  },

  /**
   * Fetch a single currency wallet by code (e.g. "USD", "NGN")
   */
  async getWalletByCurrency(currency: SupportedCurrency): Promise<Wallet> {
    const res = await apiClient.get<ApiResponse<GetWalletResponse>>(
      `/api/v1/wallets/${currency.toUpperCase()}`
    );
    if (!res.data.data?.wallet) {
      throw new Error(`Wallet not found for currency ${currency}`);
    }
    return normalizeWallet(res.data.data.wallet);
  },

  /**
   * Fetch immutable double-entry ledger transactions
   */
  async getLedgerTransactions(params?: GetLedgerTransactionsParams): Promise<LedgerTransaction[]> {
    const res = await apiClient.get<ApiResponse<GetLedgerTransactionsResponse>>(
      '/api/v1/wallets/ledger/transactions',
      {
        params: {
          limit: params?.limit ?? 20,
          offset: params?.offset ?? 0,
        },
      }
    );
    return res.data.data?.transactions || [];
  },
};
