import React from "react";

import {
  CheckoutDrawer,
  CheckoutRowItem,
} from "@/components/ui/bottom-sheets/checkout-drawer";

export interface PaySummaryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenSelectPaymentMethod: () => void;
  onPay: () => void;
  selectedCurrency: string;
  selectedBalance: string;
}

export function PaySummaryDrawer({
  visible,
  onClose,
  onOpenSelectPaymentMethod,
  onPay,
  selectedCurrency,
  selectedBalance,
}: PaySummaryDrawerProps) {
  const rows: CheckoutRowItem[] = [
    { label: "Product", value: "Virtual Card" },
    { label: "Issuance Fee", value: "$3.00" },
    {
      label: "Fee",
      value: "₦0.00",
      strikeThroughValue: "₦30.00",
    },
    { label: "Cashback", value: "+ $0.50", valueClassName: "text-[#10B981]" },
    { label: "Total", value: "$3.00" },
  ];

  return (
    <CheckoutDrawer
      visible={visible}
      onClose={onClose}
      onPay={onPay}
      heroAmount="$3"
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
