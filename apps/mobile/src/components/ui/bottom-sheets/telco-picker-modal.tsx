import React from "react";
import { Pressable, Text, View } from "react-native";

import { CompanyLogo } from "@/components/ui/company-logo";
import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { TelcoLogo, TelcoProvider } from "@/components/ui/telco-logo";
import { getTelcoLogoUrl } from "@/constants/company-logos";

export interface TelcoPickerModalProps {
  visible: boolean;
  selected: TelcoProvider;
  onSelect: (provider: TelcoProvider) => void;
  onClose: () => void;
}

const TELCOS: { id: TelcoProvider; name: string }[] = [
  { id: "mtn", name: "MTN Nigeria" },
  { id: "glo", name: "Glo (Globacom)" },
  { id: "airtel", name: "Airtel Nigeria" },
  { id: "9mobile", name: "9mobile" },
];

export function TelcoPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: TelcoPickerModalProps) {
  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      <Text className="font-satoshi text-xl font-bold text-gray-900 mb-4">
        Select Mobile Network
      </Text>

      <View className="gap-2 mb-2">
        {TELCOS.map((telco) => {
          const isSelected = selected === telco.id;

          return (
            <Pressable
              key={telco.id}
              onPress={() => {
                onSelect(telco.id);
                onClose();
              }}
              className={`flex-row items-center justify-between py-3.5 px-3 rounded-2xl active:bg-gray-50 ${
                isSelected ? "bg-orange-50/60" : ""
              }`}
            >
              <View className="flex-row items-center gap-3">
                <CompanyLogo
                  imageUrl={getTelcoLogoUrl(telco.id)}
                  fallbackLogo={<TelcoLogo provider={telco.id} size={36} />}
                  name={telco.name}
                  size={36}
                />
                <Text className="font-satoshi text-base font-semibold text-gray-900">
                  {telco.name}
                </Text>
              </View>
              {isSelected && (
                <Text className="text-orange-500 font-bold text-base">✓</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </DraggableBottomSheet>
  );
}
