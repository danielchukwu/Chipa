import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { CompanyLogo } from "@/components/ui/company-logo";
import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import {
  ElectricityProviderId,
  ElectricityProviderLogo,
} from "@/components/ui/electricity-provider-logos";
import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { ELECTRICITY_LOGOS } from "@/constants/company-logos";

export interface ElectricityProviderOption {
  id: ElectricityProviderId;
  name: string;
  shortName: string;
  imageUrl?: string;
}

export const ELECTRICITY_PROVIDERS: ElectricityProviderOption[] = [
  { id: "aedc", name: "Abuja Electricity", shortName: "AEDC", imageUrl: ELECTRICITY_LOGOS.aedc },
  { id: "ibedc", name: "Ibadan Electricity", shortName: "IBEDC", imageUrl: ELECTRICITY_LOGOS.ibedc },
  { id: "jed", name: "Jos Electricity", shortName: "JED", imageUrl: ELECTRICITY_LOGOS.jed },
  { id: "phed", name: "Port Harcourt Electricity", shortName: "PHED", imageUrl: ELECTRICITY_LOGOS.phed },
  { id: "kaedco", name: "Kaduna Electricity", shortName: "KAEDCO", imageUrl: ELECTRICITY_LOGOS.kaedco },
  { id: "ikedc", name: "Ikeja Electricity", shortName: "IKEDC", imageUrl: ELECTRICITY_LOGOS.ikedc },
  { id: "ekedc", name: "Eko Electricity", shortName: "EKEDC", imageUrl: ELECTRICITY_LOGOS.ekedc },
  { id: "eedc", name: "Enugu Electricity", shortName: "EEDC", imageUrl: ELECTRICITY_LOGOS.eedc },
  { id: "kedco", name: "Kano Electricity", shortName: "KEDCO", imageUrl: ELECTRICITY_LOGOS.kedco },
  { id: "bedc", name: "Benin Electricity", shortName: "BEDC", imageUrl: ELECTRICITY_LOGOS.bedc },
  { id: "startimes_energy", name: "Startimes Energy", shortName: "Startimes", imageUrl: ELECTRICITY_LOGOS.startimes_energy },
  { id: "yedc", name: "Yola Energy", shortName: "YEDC", imageUrl: ELECTRICITY_LOGOS.yedc },
];

export interface ElectricityProviderDrawerProps {
  visible: boolean;
  selectedId: ElectricityProviderId;
  onSelect: (provider: ElectricityProviderOption) => void;
  onClose: () => void;
}

export function ElectricityProviderDrawer({
  visible,
  selectedId,
  onSelect,
  onClose,
}: ElectricityProviderDrawerProps) {
  return (
    <DraggableBottomSheet
      visible={visible}
      onClose={onClose}
      containerClassName="max-h-[85%]"
    >
      {/* Header Bar: Back Arrow + Title */}
      <View className="relative flex-row items-center justify-center py-2 mb-3">
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="absolute left-0 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 z-10"
        >
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>
        <Text className="font-satoshi text-lg font-bold text-gray-900">
          Select Provider
        </Text>
      </View>

      {/* Providers List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingBottom: 16 }}
      >
        {ELECTRICITY_PROVIDERS.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              className={`flex-row items-center px-4 py-3 rounded-2xl active:opacity-80 transition-colors ${
                isSelected ? "bg-[#F3F4F6]" : "bg-transparent"
              }`}
            >
              <CompanyLogo
                imageUrl={item.imageUrl}
                fallbackLogo={<ElectricityProviderLogo provider={item.id} size={38} />}
                name={item.name}
                size={38}
              />
              <Text className="font-satoshi text-base font-bold text-gray-900 ml-4">
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </DraggableBottomSheet>
  );
}

