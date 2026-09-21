export interface WelcomeOffering {
  id: string;
  title: string;
  subtitle: string;
  type: 'get_paid' | 'fx_rates' | 'timing_vault' | 'subscriptions' | 'virtual_cards';
}

export const WELCOME_OFFERINGS: WelcomeOffering[] = [
  {
    id: 'get-paid',
    title: 'Get paid from anywhere using Chipa',
    subtitle: 'Receive money in USD, GBP & EUR.',
    type: 'get_paid',
  },
  {
    id: 'fx-rates',
    title: 'Stop losing money on FX',
    subtitle: 'Convert your money to NGN at the cheapest rates.',
    type: 'fx_rates',
  },
  {
    id: 'timing-vault',
    title: 'Your money, your timing...',
    subtitle: "Keep your USD, GBP or EUR until you're ready to convert it.",
    type: 'timing_vault',
  },
  {
    id: 'subscriptions',
    title: 'Subscribe without worries',
    subtitle: 'Pay for Netflix, Apple, Google, SaaS and other international services with ease.',
    type: 'subscriptions',
  },
  {
    id: 'virtual-cards',
    title: 'Create a card for anything',
    subtitle: 'Create multiple Visa and Mastercard cards for your subscriptions, spending and business.',
    type: 'virtual_cards',
  },
];
