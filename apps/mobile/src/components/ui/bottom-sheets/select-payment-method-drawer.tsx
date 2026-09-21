import React from "react";
import { Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";

export interface PaymentMethodOption {
  code: string;
  flag: string;
  balance: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { code: "NGN", flag: "🇳🇬", balance: "₦2,800.00" },
  { code: "USD", flag: "🇺🇸", balance: "$2,800.98" },
  { code: "GBP", flag: "🇬🇧", balance: "£2,800.98" },
  { code: "EUR", flag: "🇪🇺", balance: "$2,800.98" },
];

export interface SelectPaymentMethodDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: PaymentMethodOption) => void;
}

export function SelectPaymentMethodDrawer({
  visible,
  onClose,
  onSelect,
}: SelectPaymentMethodDrawerProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Header: Back button & Title */}
      <View className="flex-row items-center mb-6">
        <Pressable
          onPress={onClose}
          hitSlop={10}
          className="w-9 h-9 rounded-full items-center justify-center mr-3 active:bg-gray-100"
        >
          <BackArrowIcon width={20} height={20} color="#111827" />
        </Pressable>
        <Text className="font-satoshi text-xl font-bold text-gray-900">
          Select Payment Method
        </Text>
      </View>

      {/* Accounts List */}
      <View className="gap-2 mb-4">
        {PAYMENT_METHODS.map((method) => (
          <Pressable
            key={method.code}
            onPress={() => onSelect(method)}
            className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50"
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">{method.flag}</Text>
              <Text className="font-satoshi text-base font-bold text-gray-900">
                {method.code}
              </Text>
            </View>
            <Text className="font-satoshi text-base font-semibold text-gray-900">
              {method.balance}
            </Text>
          </Pressable>
        ))}
      </View>
    </DraggableBottomSheet>
  );
}
