import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import { TelcoLogo, TelcoProvider } from "@/components/ui/telco-logo";

export interface DataCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenSelectPaymentMethod: () => void;
  onPay: () => void;
  amount: number;
  phoneNumber: string;
  network: TelcoProvider;
  bundleName: string;
  selectedCurrency: string;
  selectedBalance: string;
}

export function DataCheckoutDrawer({
  visible,
  onClose,
  onOpenSelectPaymentMethod,
  onPay,
  amount,
  phoneNumber,
  network,
  bundleName,
  selectedCurrency,
  selectedBalance,
}: DataCheckoutDrawerProps) {
  const heroAmount = `₦${amount.toLocaleString("en-US")}`;
  const formattedAmount = `₦${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedPhone =
    phoneNumber.length === 11
      ? `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 7)} ${phoneNumber.slice(7)}`
      : phoneNumber.length === 10
      ? `0${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 6)} ${phoneNumber.slice(6)}`
      : phoneNumber || "091 5120 7528";

  const networkLabel =
    network === "mtn"
      ? "MTN"
      : network === "glo"
      ? "GLO"
      : network === "airtel"
      ? "AIRTEL"
      : "9MOBILE";

  const rows: CheckoutRowItem[] = [
    { label: "Phone number", value: formattedPhone },
    {
      label: "Network",
      valueNode: (
        <View className="flex-row items-center gap-2">
          <TelcoLogo provider={network} size={20} />
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            {networkLabel}
          </Text>
        </View>
      ),
    },
    { label: "Data plan", value: bundleName },
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
