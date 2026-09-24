import { SupportedCurrency } from './common';

export type CardScheme = 'visa' | 'mastercard';
export type CardType = 'virtual' | 'physical';
export type CardStatus = 'active' | 'frozen' | 'terminated' | 'pending';

export interface Card {
  id: string;
  name: string;
  currency: SupportedCurrency;
  scheme: CardScheme;
  type: CardType;
  status: CardStatus;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  balance?: number | string;
  formattedBalance?: string;
  colorTheme?: string;
  createdAt: string;
}

export interface CardDetails extends Card {
  pan: string;
  cvv: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface CreateCardRequest {
  name: string;
  currency?: SupportedCurrency;
  scheme?: CardScheme;
  type?: CardType;
}

export interface FundCardRequest {
  amount: number;
  from_currency: SupportedCurrency;
  pin: string;
}

export interface ListCardsResponse {
  cards: Card[];
}

export interface CardResponse {
  card: Card;
}

export interface CardDetailsResponse {
  card: CardDetails;
}
