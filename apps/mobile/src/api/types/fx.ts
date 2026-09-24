import { SupportedCurrency } from './common';

export interface ExchangeRate {
  pair: string;
  rate: number;
  bid: number;
  ask: number;
  spreadPercent?: number;
  updatedAt: string;
}

export interface FXRatesResponse {
  rates: Record<string, number> | ExchangeRate[];
}

export interface CreateQuoteRequest {
  from_currency: SupportedCurrency;
  to_currency: SupportedCurrency;
  send_amount: number;
}

export interface FXQuote {
  quote_id: string;
  id?: string;
  from_currency: SupportedCurrency;
  to_currency: SupportedCurrency;
  send_amount: number;
  receive_amount: number;
  rate: number;
  fee: number;
  expires_at: string;
  expiresInSeconds?: number;
}

export interface CreateQuoteResponse {
  quote: FXQuote;
}

export interface ExecuteSwapRequest {
  quote_id: string;
  pin: string;
}

export interface ExecuteSwapResponse {
  swap: FXQuote & {
    transaction_id?: string;
    status: 'completed' | 'pending' | 'failed';
  };
}
