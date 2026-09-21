import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type CardBrand = 'visa' | 'mastercard';
export type CardCurrency = 'USD' | 'NGN' | 'EUR' | 'GBP' | 'AED' | 'KWD' | 'AUD';

export interface VirtualCard {
  id: string;
  name: string;
  brand: CardBrand;
  last4: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  type: string;
  currency: CardCurrency;
  balance: string;
  isFrozen: boolean;
  theme: 'black' | 'champagne' | 'navy';
}

const INITIAL_CARDS: VirtualCard[] = [
  {
    id: 'card_1',
    name: "Daniel's Card",
    brand: 'visa',
    last4: '3814',
    cardNumber: '4242 8190 3120 3814',
    expiry: '08/29',
    cvv: '842',
    type: 'Virtual card',
    currency: 'USD',
    balance: '$1,250.00',
    isFrozen: false,
    theme: 'champagne',
  },
  {
    id: 'card_2',
    name: "Daniel's Card",
    brand: 'mastercard',
    last4: '3814',
    cardNumber: '5399 4410 7721 3814',
    expiry: '11/28',
    cvv: '319',
    type: 'Virtual card',
    currency: 'NGN',
    balance: '₦850,000.00',
    isFrozen: false,
    theme: 'black',
  },
  {
    id: 'card_3',
    name: "Daniel's Card",
    brand: 'visa',
    last4: '3814',
    cardNumber: '4012 9901 6452 3814',
    expiry: '03/30',
    cvv: '556',
    type: 'Virtual card',
    currency: 'EUR',
    balance: '€640.00',
    isFrozen: false,
    theme: 'navy',
  },
];

interface CardsContextType {
  cards: VirtualCard[];
  toggleFreezeCard: (id: string) => void;
  allocateFunds: (id: string, amount: number) => void;
  addCard: (newCard: Partial<VirtualCard>) => VirtualCard;
  updateCardNickname: (id: string, name: string) => void;
  deleteCard: (id: string) => void;
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<VirtualCard[]>(INITIAL_CARDS);

  const toggleFreezeCard = useCallback((id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isFrozen: !card.isFrozen } : card
      )
    );
  }, []);

  const allocateFunds = useCallback((id: string, amount: number) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === id) {
          const currentNum = parseFloat(card.balance.replace(/[^0-9.]/g, '')) || 0;
          const newTotal = (currentNum + amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const symbol = card.currency === 'NGN' ? '₦' : card.currency === 'EUR' ? '€' : card.currency === 'GBP' ? '£' : '$';
          return { ...card, balance: `${symbol}${newTotal}` };
        }
        return card;
      })
    );
  }, []);

  const updateCardNickname = useCallback((id: string, name: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, name: name.trim() || card.name } : card
      )
    );
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const addCard = useCallback((newCard: Partial<VirtualCard>) => {
    const randomLast4 = Math.floor(1000 + Math.random() * 9000).toString();
    const brand = newCard.brand || 'visa';
    const card: VirtualCard = {
      id: `card_${Date.now()}`,
      name: newCard.name?.trim() || "Daniel's Card",
      brand,
      last4: randomLast4,
      cardNumber: `${brand === 'visa' ? '4242' : '5399'} •••• •••• ${randomLast4}`,
      expiry: '12/30',
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      type: 'Virtual card',
      currency: newCard.currency || 'USD',
      balance: `$0.00`,
      isFrozen: false,
      theme: brand === 'visa' ? 'black' : 'champagne',
    };
    setCards((prev) => [card, ...prev]);
    return card;
  }, []);

  const value = useMemo(
    () => ({
      cards,
      toggleFreezeCard,
      allocateFunds,
      addCard,
      updateCardNickname,
      deleteCard,
    }),
    [cards, toggleFreezeCard, allocateFunds, addCard, updateCardNickname, deleteCard]
  );

  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>;
}

export function useCards(): CardsContextType {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
}
