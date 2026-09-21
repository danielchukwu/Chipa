import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { CheckIcon } from "@/components/ui/icons/check-icon";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  icon?: string | React.ReactNode;
}

export interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue?: string;
  onSelect: (option: SelectOption) => void;
  onClose: () => void;
  searchable?: boolean;
}

export function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  searchable = false,
}: SelectModalProps) {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  const handleSelect = (item: SelectOption) => {
    onSelect(item);
    setSearch("");
    onClose();
  };

  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-2xl font-bold text-gray-900 mb-4">
        {title}
      </Text>

      {/* Optional Search */}
      {searchable && (
        <View className="mb-3">
          <View className="h-12 bg-gray-100 rounded-2xl px-3.5 flex-row items-center">
            <Text className="text-gray-400 mr-2 text-sm">🔍</Text>
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 font-inter text-base text-gray-900"
            />
          </View>
        </View>
      )}

      {/* Options List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-[440px]"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {filteredOptions.map((item) => {
          const isSelected = item.value === selectedValue;
          return (
            <Pressable
              key={item.value}
              onPress={() => handleSelect(item)}
              className={cn(
                "flex-row items-center justify-between py-3.5 px-3 rounded-2xl active:bg-gray-50 mb-1",
                isSelected && "bg-gray-50",
              )}
            >
              <View className="flex-row items-center gap-3.5 flex-1 mr-2">
                {typeof item.icon === "string" ? (
                  <Text className="text-2xl">{item.icon}</Text>
                ) : (
                  item.icon
                )}
                <Text
                  className={cn(
                    "font-inter text-base",
                    isSelected
                      ? "font-bold text-gray-900"
                      : "font-normal text-gray-800",
                  )}
                >
                  {item.label}
                </Text>
              </View>
              {isSelected && <CheckIcon size={18} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </DraggableBottomSheet>
  );
}
