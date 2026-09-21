import React from "react";
import { Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { VirtualCard } from "@/context/cards-context";

export interface FreezeCardDrawerProps {
  visible: boolean;
  card: VirtualCard;
  onClose: () => void;
  onProceed: () => void;
}

export function FreezeCardDrawer({
  visible,
  card,
  onClose,
  onProceed,
}: FreezeCardDrawerProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-[24px] font-bold text-gray-900 leading-[30px] mb-8">
        {card.isFrozen
          ? "Are you sure you want to unfreeze this card?"
          : "Are you sure you want to freeze this\ncard?"}
      </Text>

      {/* Card Representation Row */}
      <View className="flex-row items-center justify-between mb-10">
        <View className="flex-row items-center flex-1 mr-4">
          {/* Mini Card Thumbnail */}
          <View className="w-14 h-9 bg-[#1E1B3A] rounded-xl items-center justify-center mr-3 shadow-xs">
            {card.brand === "mastercard" ? (
              <View className="flex-row items-center -space-x-1.5">
                <View className="w-4 h-4 rounded-full bg-[#EB001B]" />
                <View className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-95" />
              </View>
            ) : (
              <Text className="font-satoshi text-xs font-black italic tracking-tighter text-white">
                VISA
              </Text>
            )}
          </View>

          {/* Card Title & Last 4 */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-satoshi text-base font-bold text-gray-900"
            >
              {card.name}
            </Text>
            <Text className="font-sans text-sm text-gray-400 mt-0.5">
              ••{card.last4}
            </Text>
          </View>
        </View>

        {/* Right Tag */}
        <Text className="font-sans text-sm text-gray-400">Virtual card</Text>
      </View>

      {/* Action Buttons: Cancel and Proceed */}
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onClose}
          className="flex-1 h-14 bg-black rounded-full items-center justify-center active:opacity-85"
        >
          <Text className="font-satoshi text-base font-bold text-[#FEE6C5]">
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            onProceed();
            onClose();
          }}
          className="flex-1 h-14 bg-[#F25805] rounded-full items-center justify-center active:opacity-85"
        >
          <Text className="font-satoshi text-base font-bold text-[#FEE6C5]">
            Proceed
          </Text>
        </Pressable>
      </View>
    </DraggableBottomSheet>
  );
}

