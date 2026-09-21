import React from "react";
import { Text, View } from "react-native";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";
import { CHPIcon } from "@/components/ui/icons/currencies";

export interface TransferChipaCheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onPay: () => void;
  amount: string;
  chipaTag: string;
  recipientName: string;
  availableBalance?: string;
}

export function TransferChipaCheckoutDrawer({
  visible,
  onClose,
  onPay,
  amount,
  chipaTag,
  recipientName,
  availableBalance = "₦2,800.00",
}: TransferChipaCheckoutDrawerProps) {
  const formattedAmount = amount.startsWith("₦") ? amount : `₦${amount}`;

  const rows: CheckoutRowItem[] = [
    {
      label: "Transfer to",
      valueNode: (
        <View className="flex-row items-center gap-1.5">
          <CHPIcon size={20} />
          <Text className="font-satoshi text-sm font-bold text-gray-900">
            Chipa Account
          </Text>
        </View>
      ),
    },
    { label: "Chipa Tag", value: chipaTag || "@chioma" },
    { label: "Name", value: recipientName },
    {
      label: "Fee",
      value: "Free (₦0.00)",
      valueClassName: "text-[#10B981]",
    },
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
      payButtonClassName="bg-[#F05D09]"
    />
  );
}
