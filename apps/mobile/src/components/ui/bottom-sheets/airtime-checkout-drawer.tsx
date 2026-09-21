import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import { TelcoLogo, TelcoProvider } from "@/components/ui/telco-logo";

export interface AirtimeCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenSelectPaymentMethod: () => void;
  onPay: () => void;
  amount: number;
  phoneNumber: string;
  network: string;
  selectedCurrency: string;
  selectedBalance: string;
}

export function AirtimeCheckoutDrawer({
  visible,
  onClose,
  onOpenSelectPaymentMethod,
  onPay,
  amount,
  phoneNumber,
  network,
  selectedCurrency,
  selectedBalance,
}: AirtimeCheckoutDrawerProps) {
  const formattedAmount = `₦${amount.toLocaleString("en-US")}`;
  const discountAmount = Math.min(10, Math.round(amount * 0.002));
  const amountPaid = `₦${(amount - discountAmount).toLocaleString("en-US", {
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
      ? "Airtel"
      : "9mobile";

  const rows: CheckoutRowItem[] = [
    { label: "Phone number", value: formattedPhone },
    {
      label: "Network",
      valueNode: (
        <View className="flex-row items-center gap-2">
          <TelcoLogo provider={network as TelcoProvider} size={20} />
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            {networkLabel}
          </Text>
        </View>
      ),
    },
    { label: "Amount", value: formattedAmount },
    {
      label: "Discount",
      value: `-₦${discountAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      valueClassName: "text-[#10B981]",
    },
    { label: "Amount paid", value: amountPaid },
  ];

  return (
    <CheckoutDrawer
      visible={visible}
      onClose={onClose}
      onPay={onPay}
      heroAmount={formattedAmount}
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
