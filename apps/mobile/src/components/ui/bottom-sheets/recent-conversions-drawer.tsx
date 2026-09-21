import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import {
  CHPIcon,
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from "@/components/ui/icons/currencies";
import { type RecentConversion } from "@/context/recent-conversions-context";

function ArrowRightIcon({ color = "#374151" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ color = "#111827" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function renderFlag(currency: string, flagOverride?: string, size = 28) {
  if (flagOverride === "UK" || currency === "GBP") {
    return <GBPIcon size={size} />;
  }
  if (flagOverride === "EU" || currency === "EUR") {
    return <EURIcon size={size} />;
  }
  if (flagOverride === "US" || currency === "USD") {
    return <USDIcon size={size} />;
  }
  if (flagOverride === "NG" || currency === "NGN") {
    return <NGNIcon size={size} />;
  }
  if (currency === "CHP" || currency === "CHIPA") {
    return <CHPIcon size={size} />;
  }
  return <NGNIcon size={size} />;
}

export interface RecentConversionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  recentConversions: RecentConversion[];
  onSelect: (conversion: RecentConversion) => void;
  onNew: () => void;
}

export function RecentConversionsDrawer({
  visible,
  onClose,
  recentConversions,
  onSelect,
  onNew,
}: RecentConversionsDrawerProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-2xl font-bold text-gray-900 mb-6">
        Recent
      </Text>

      {/* List of Recent Conversions */}
      <View className="gap-1 mb-4">
        {recentConversions.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item)}
            className="flex-row items-center py-3.5 px-1 active:bg-gray-50 rounded-2xl"
          >
            {/* From currency (Flag + Label) */}
            <View className="flex-row items-center gap-3.5 w-28">
              {renderFlag(item.from, item.fromFlag)}
              <Text className="font-satoshi text-base font-bold text-gray-900">
                {item.from}
              </Text>
            </View>

            {/* Arrow */}
            <View className="w-16 items-center">
              <ArrowRightIcon color="#374151" />
            </View>

            {/* To currency (Flag + Label) */}
            <View className="flex-row items-center gap-3.5 flex-1">
              {renderFlag(item.to, item.toFlag)}
              <Text className="font-satoshi text-base font-bold text-gray-900">
                {item.displayTo || item.to}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* + New Button */}
      <Pressable
        onPress={onNew}
        className="w-full h-14 bg-[#F8F9FA] rounded-[22px] flex-row items-center justify-center gap-2 active:bg-gray-200 mt-2"
      >
        <PlusIcon color="#111827" />
        <Text className="font-satoshi text-base font-bold text-gray-900">
          New
        </Text>
      </Pressable>
    </DraggableBottomSheet>
  );
}
