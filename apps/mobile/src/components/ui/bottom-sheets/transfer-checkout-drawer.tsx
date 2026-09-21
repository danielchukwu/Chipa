import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import {
  AccessBankLogo,
  MoniepointLogo,
  OPayLogo,
} from "@/components/ui/transaction-brand-logos";

export interface TransferCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onPay: () => void;
  amount: string;
  bankName: string;
  accountNumber: string;
  recipientName: string;
  stampDuty?: string;
  feeOriginal?: string;
  feeDiscounted?: string;
  availableBalance?: string;
}

export function TransferCheckoutDrawer({
  visible,
  onClose,
  onPay,
  amount,
  bankName,
  accountNumber,
  recipientName,
  stampDuty = "₦0.00",
  feeOriginal = "₦30.00",
  feeDiscounted = "₦20.00",
  availableBalance = "₦2,800.00",
}: TransferCheckoutDrawerProps) {
  const formattedAmount = amount.startsWith("₦") ? amount : `₦${amount}`;

  const renderBankIcon = () => {
    const b = bankName.toLowerCase();
    if (b.includes("access")) return <AccessBankLogo size={18} />;
    if (b.includes("monie") || b.includes("point"))
      return <MoniepointLogo size={18} />;
    return <OPayLogo size={18} />;
  };

  const rows: CheckoutRowItem[] = [
    {
      label: "Transfer to",
      valueNode: (
        <View className="flex-row items-center gap-1.5">
          {renderBankIcon()}
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            {bankName}
          </Text>
        </View>
      ),
    },
    { label: "Bank", value: bankName },
    { label: "Account number", value: accountNumber },
    { label: "Name", value: recipientName },
    {
      label: "Fee",
      value: feeDiscounted,
      strikeThroughValue: feeOriginal,
      valueClassName: "text-gray-900",
    },
    { label: "Stamp duty", value: stampDuty },
  ];

  return (
    <CheckoutDrawer
      visible={visible}
      onClose={onClose}
      onPay={onPay}
      heroAmount={formattedAmount}
      rows={rows}
      paymentMethod={{
        currency: "NGN",
        balance: availableBalance,
        clickable: false,
      }}
      payButtonText="Pay"
    />
  );
}
