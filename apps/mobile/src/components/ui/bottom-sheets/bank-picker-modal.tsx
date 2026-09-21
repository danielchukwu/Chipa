import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { CloseIcon } from "@/components/ui/icons/snowflake-icon";
import {
  AccessBankLogo,
  GTBankLogo,
  MoniepointLogo,
  OPayLogo,
} from "@/components/ui/transaction-brand-logos";

export interface BankItem {
  id: string;
  name: string;
  code: string;
}

export const POPULAR_BANKS: BankItem[] = [
  { id: "opay", name: "OPAY", code: "999992" },
  { id: "access", name: "Access Bank", code: "044" },
  { id: "moniepoint", name: "MONIE POINT", code: "50515" },
  { id: "gtb", name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { id: "kuda", name: "Kuda Microfinance Bank", code: "50211" },
  { id: "zenith", name: "Zenith Bank", code: "057" },
  { id: "palmpay", name: "PalmPay", code: "999991" },
  { id: "firstbank", name: "First Bank of Nigeria", code: "011" },
  { id: "uba", name: "United Bank for Africa (UBA)", code: "033" },
];

export interface BankPickerModalProps {
  visible: boolean;
  selectedBank: string;
  onSelect: (bank: BankItem) => void;
  onClose: () => void;
}

export function BankPickerModal({
  visible,
  selectedBank,
  onSelect,
  onClose,
}: BankPickerModalProps) {
  const [search, setSearch] = useState("");

  const filteredBanks = POPULAR_BANKS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderLogo = (id: string) => {
    if (id === "access") return <AccessBankLogo size={32} />;
    if (id === "moniepoint") return <MoniepointLogo size={32} />;
    if (id === "gtb") return <GTBankLogo size={32} />;
    return <OPayLogo size={32} />;
  };

  return (
    <DraggableBottomSheet
      visible={visible}
      onClose={onClose}
      containerClassName="max-h-[85%]"
    >
      {/* Header */}
      <View className="relative items-center justify-center py-2 mb-4">
        <Text className="font-satoshi text-lg font-bold text-gray-900">
          Select Bank
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="absolute right-0 w-8 h-8 rounded-full items-center justify-center active:bg-gray-100"
        >
          <CloseIcon width={16} height={16} color="#6B7280" />
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
        <TextInput
          placeholder="Search bank name..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          className="flex-1 font-sans text-sm text-gray-900"
        />
      </View>

      {/* Banks List */}
      <ScrollView showsVerticalScrollIndicator={false} className="mb-2 max-h-96">
        {filteredBanks.map((bank) => {
          const isSelected =
            selectedBank.toLowerCase() === bank.name.toLowerCase();

          return (
            <Pressable
              key={bank.id}
              onPress={() => {
                onSelect(bank);
                onClose();
              }}
              className={`flex-row items-center justify-between py-3.5 px-3 rounded-2xl active:bg-gray-50 mb-1 ${
                isSelected ? "bg-orange-50/60" : ""
              }`}
            >
              <View className="flex-row items-center gap-3">
                {renderLogo(bank.id)}
                <Text className="font-satoshi text-base font-semibold text-gray-900">
                  {bank.name}
                </Text>
              </View>
              {isSelected && (
                <Text className="text-orange-500 font-bold text-base">✓</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </DraggableBottomSheet>
  );
}
