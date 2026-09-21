import React from "react";
import { Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { AsteriskIcon } from "@/components/ui/icons/asterisk-icon";
import { SMSIcon } from "@/components/ui/icons/sms-icon";
import { WhatsAppIcon } from "@/components/ui/icons/whatsapp-icon";

export interface VerificationChannelDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectChannel: (channel: "whatsapp" | "sms") => void;
}

export function VerificationChannelDrawer({
  visible,
  onClose,
  onSelectChannel,
}: VerificationChannelDrawerProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      <View className="items-center mb-6">
        <View className="w-14 h-14 rounded-full bg-[#FFF5F5] items-center justify-center">
          <AsteriskIcon width={24} height={24} color="#FF3B30" />
        </View>
      </View>
      <Text className="font-satoshi text-2xl font-bold text-gray-900 tracking-[-0.5px] leading-tight mb-6">
        Choose where to receive{"\n"}verification code?
      </Text>
      <View className="gap-3 mb-2">
        <Pressable
          onPress={() => onSelectChannel("whatsapp")}
          className="w-full h-16 bg-gray-100 active:bg-gray-200 rounded-2xl px-5 flex-row items-center gap-4"
        >
          <WhatsAppIcon width={28} height={28} />
          <Text className="font-inter text-base font-semibold text-gray-900">
            Whatsapp
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onSelectChannel("sms")}
          className="w-full h-16 bg-gray-100 active:bg-gray-200 rounded-2xl px-5 flex-row items-center gap-4"
        >
          <SMSIcon width={28} height={28} />
          <Text className="font-inter text-base font-semibold text-gray-900">
            SMS
          </Text>
        </Pressable>
      </View>
    </DraggableBottomSheet>
  );
}
