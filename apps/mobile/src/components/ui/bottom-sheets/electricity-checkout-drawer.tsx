import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import {
  ElectricityProviderId,
  ElectricityProviderLogo,
} from "@/components/ui/electricity-provider-logos";

export interface ElectricityCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenSelectPaymentMethod: () => void;
  onPay: () => void;
  amount: number;
  providerId: ElectricityProviderId;
  providerName: string;
  meterType: "Prepaid" | "Postpaid";
  meterNumber: string;
  selectedCurrency: string;
  selectedBalance: string;
}

export function ElectricityCheckoutDrawer({
  visible,
  onClose,
  onOpenSelectPaymentMethod,
  onPay,
  amount,
  providerId,
  providerName,
  meterType,
  meterNumber,
  selectedCurrency,
  selectedBalance,
}: ElectricityCheckoutDrawerProps) {
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
          <ElectricityProviderLogo provider={providerId} size={20} />
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            {providerName}
          </Text>
        </View>
      ),
    },
    { label: "Meter type", value: meterType },
    { label: "Meter number", value: meterNumber || "4481739942" },
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
