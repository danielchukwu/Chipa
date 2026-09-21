import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import { TvProviderId, TvProviderLogo } from "@/components/ui/tv-brand-logos";

export interface TvCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenSelectPaymentMethod: () => void;
  onPay: () => void;
  amount: number;
  providerId: TvProviderId;
  providerName: string;
  smartcardNumber: string;
  packageName: string;
  selectedCurrency: string;
  selectedBalance: string;
}

export function TvCheckoutDrawer({
  visible,
  onClose,
  onOpenSelectPaymentMethod,
  onPay,
  amount,
  providerId,
  providerName,
  smartcardNumber,
  packageName,
  selectedCurrency,
  selectedBalance,
}: TvCheckoutDrawerProps) {
  const heroAmount = `₦${amount.toLocaleString("en-US")}`;
  const formattedAmount = `₦${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const rows: CheckoutRowItem[] = [
    {
      label: "Provider",
      valueNode: (
        <View className="flex-row items-center gap-2">
          <TvProviderLogo provider={providerId} size={20} />
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            {providerName}
          </Text>
        </View>
      ),
    },
    { label: "Package", value: packageName },
    { label: "Smartcard number", value: smartcardNumber || "88290138456" },
    { label: "Amount", value: formattedAmount },
  ];

  return (
    <CheckoutDrawer
      visible={visible}
      onClose={onClose}
      onPay={onPay}
      heroAmount={heroAmount}
      rows={rows}
      paymentMethod={{
        currency: selectedCurrency,
        balance: selectedBalance,
        onPress: onOpenSelectPaymentMethod,
        clickable: true,
      }}
      payButtonText="Pay"
    />
  );
}
