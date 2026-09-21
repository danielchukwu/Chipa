import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import {
  CHPIcon,
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from "@/components/ui/icons/currencies";

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

function renderDrawerFlag(currency: string, size = 18) {
  switch (currency) {
    case "NGN":
      return <NGNIcon size={size} />;
    case "USD":
      return <USDIcon size={size} />;
    case "GBP":
      return <GBPIcon size={size} />;
    case "EUR":
      return <EURIcon size={size} />;
    case "CHP":
      return <CHPIcon size={size} />;
    default:
      return <NGNIcon size={size} />;
  }
}

export interface ConvertCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  rate: string;
  fee?: string;
  availableBalance?: string;
}

export function ConvertCheckoutDrawer({
  visible,
  onClose,
  onConfirm,
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  rate,
  fee = "$0.00",
  availableBalance = "$2,800.98",
}: ConvertCheckoutDrawerProps) {
  const toSymbol = CURRENCY_SYMBOLS[toCurrency] || toCurrency;
  const fromSymbol = CURRENCY_SYMBOLS[fromCurrency] || fromCurrency;

  const rows: CheckoutRowItem[] = [
    {
      label: "You convert",
      valueNode: (
        <View className="flex-row items-center gap-1.5">
          {renderDrawerFlag(fromCurrency)}
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            {fromSymbol}
            {fromAmount}
          </Text>
        </View>
      ),
    },
    { label: "Rate", value: rate },
    { label: "Fee", value: fee },
    {
      label: "You receive",
      valueNode: (
        <View className="flex-row items-center gap-1.5">
          {renderDrawerFlag(toCurrency)}
          <Text className="font-satoshi text-sm font-bold text-[#10B981]">
            {toSymbol}
            {toAmount}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <CheckoutDrawer
      visible={visible}
      onClose={onClose}
      onPay={onConfirm}
      heroAmount={`${fromSymbol}${fromAmount}`}
      rows={rows}
      paymentMethod={{
        currency: fromCurrency,
        flag: renderDrawerFlag(fromCurrency, 22),
        balance: availableBalance,
        clickable: false,
      }}
      payButtonText="Convert"
    />
  );
}
