import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { CompanyLogo } from "@/components/ui/company-logo";
import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { TvProviderId, TvProviderLogo } from "@/components/ui/tv-brand-logos";
import { TV_LOGOS } from "@/constants/company-logos";

export interface TvProviderOption {
  id: TvProviderId;
  name: string;
  smartcardLabel: string;
  placeholder: string;
  imageUrl?: string;
}

export const TV_PROVIDERS: TvProviderOption[] = [
  {
    id: "dstv",
    name: "DSTV",
    smartcardLabel: "Smartcard Number",
    placeholder: "Enter smartcard number",
    imageUrl: TV_LOGOS.dstv,
  },
  {
    id: "gotv",
    name: "GOTV",
    smartcardLabel: "IUC Number",
    placeholder: "Enter IUC number",
    imageUrl: TV_LOGOS.gotv,
  },
  {
    id: "startimes",
    name: "StarTimes",
    smartcardLabel: "eCN / Smartcard Number",
    placeholder: "Enter smartcard number",
    imageUrl: TV_LOGOS.startimes,
  },
  {
    id: "startimes_on",
    name: "StarTimes ON",
    smartcardLabel: "Account Number / Phone",
    placeholder: "Enter account number",
    imageUrl: TV_LOGOS.startimes_on,
  },
  {
    id: "showmax",
    name: "SHOWMAX",
    smartcardLabel: "Phone / Account Number",
    placeholder: "Enter phone or email",
    imageUrl: TV_LOGOS.showmax,
  },
];

export interface TvProviderDrawerProps {
  visible: boolean;
  selectedId: TvProviderId;
  onSelect: (provider: TvProviderOption) => void;
  onClose: () => void;
}

export function TvProviderDrawer({
  visible,
  selectedId,
  onSelect,
  onClose,
}: TvProviderDrawerProps) {
  return (
    <DraggableBottomSheet
      visible={visible}
      onClose={onClose}
      containerClassName="max-h-[80%]"
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
          Select TV Provider
        </Text>
      </View>

      {/* Providers List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
      >
        {TV_PROVIDERS.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              className={`flex-row items-center px-4 py-3.5 rounded-2xl active:opacity-80 transition-colors ${
                isSelected ? "bg-[#F3F4F6]" : "bg-transparent"
              }`}
            >
              <CompanyLogo
                imageUrl={item.imageUrl}
                fallbackLogo={<TvProviderLogo provider={item.id} size={38} />}
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
