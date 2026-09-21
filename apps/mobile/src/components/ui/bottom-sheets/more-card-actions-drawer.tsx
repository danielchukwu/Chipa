import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path, type SvgProps } from "react-native-svg";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { ChevronRightIcon } from "@/components/ui/icons/app-icons";
import {
  CancelCardBadgeIcon,
  HistoryClockIcon,
} from "@/components/ui/icons/snowflake-icon";

function EditNicknameIcon(props: SvgProps) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface MoreCardActionsDrawerProps {
  visible: boolean;
  onClose: () => void;
  onTransactionHistory: () => void;
  onEditNickname: () => void;
  onCancelCard: () => void;
}

export function MoreCardActionsDrawer({
  visible,
  onClose,
  onTransactionHistory,
  onEditNickname,
  onCancelCard,
}: MoreCardActionsDrawerProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-[24px] font-bold text-gray-900 mb-6">
        More
      </Text>

      {/* Options List */}
      <View className="space-y-1 mb-2">
        {/* 1. Transaction History */}
        <Pressable
          onPress={() => {
            onClose();
            onTransactionHistory();
          }}
          className="flex-row items-center justify-between py-4 active:opacity-60"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-8 items-center justify-center mr-3">
              <HistoryClockIcon width={24} height={24} color="#111827" />
            </View>
            <Text className="font-satoshi text-base font-semibold text-gray-900">
              Transaction History
            </Text>
          </View>
          <ChevronRightIcon width={18} height={18} color="#6B7280" />
        </Pressable>

        {/* 2. Edit card nickname */}
        <Pressable
          onPress={() => {
            onClose();
            setTimeout(onEditNickname, 250);
          }}
          className="flex-row items-center justify-between py-4 active:opacity-60"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-8 items-center justify-center mr-3">
              <EditNicknameIcon width={22} height={22} color="#111827" />
            </View>
            <Text className="font-satoshi text-base font-semibold text-gray-900">
              Edit card nickname
            </Text>
          </View>
          <ChevronRightIcon width={18} height={18} color="#6B7280" />
        </Pressable>

        {/* 3. Cancel card */}
        <Pressable
          onPress={() => {
            onClose();
            setTimeout(onCancelCard, 250);
          }}
          className="flex-row items-center justify-between py-4 active:opacity-60"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-8 items-center justify-center mr-3">
              <CancelCardBadgeIcon width={24} height={24} color="#111827" />
            </View>
            <Text className="font-satoshi text-base font-semibold text-gray-900">
              Cancel card
            </Text>
          </View>
          <ChevronRightIcon width={18} height={18} color="#6B7280" />
        </Pressable>
      </View>
    </DraggableBottomSheet>
  );
}

