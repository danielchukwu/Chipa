import React from "react";
import { Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { BankIcon, ChevronRightIcon } from "@/components/ui/icons/app-icons";
import { CHPIcon } from "@/components/ui/icons/currencies";

export interface TransferTypeDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: () => void;
  onSelectChipa: () => void;
}

export function TransferTypeDrawer({
  visible,
  onClose,
  onSelectBank,
  onSelectChipa,
}: TransferTypeDrawerProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-xl font-bold text-gray-900 mb-6">
        Transfer to
      </Text>

      {/* Option 1: Bank Account */}
      <Pressable
        onPress={() => {
          onClose();
          onSelectBank();
        }}
        className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
            <BankIcon color="#374151" />
          </View>
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Bank Account
          </Text>
        </View>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>

      {/* Option 2: Chipa Account */}
      <Pressable
        onPress={() => {
          onClose();
          onSelectChipa();
        }}
        className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50"
      >
        <View className="flex-row items-center gap-3.5">
          <CHPIcon size={32} />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Chipa Account
          </Text>
        </View>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>
    </DraggableBottomSheet>
  );
}
