import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { CheckIcon } from "@/components/ui/icons/check-icon";
import {
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from "@/components/ui/icons/currencies";
import { DownArrowIcon } from "@/components/ui/icons/down-arrow-icon";
import { COUNTRIES, Country } from "@/context/register-context";
import { InputLabel } from "@/components/ui/input-label";
import { cn } from "@/lib/utils";

export interface PhoneInputProps extends Omit<
  TextInputProps,
  "value" | "onChangeText"
> {
  country: Country;
  onSelectCountry: (country: Country) => void;
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  containerClassName?: string;
}

export function CountryFlagIcon({
  country,
  size = 24,
}: {
  country: Country;
  size?: number;
}) {
  if (country.code === "NG") return <NGNIcon size={size} />;
  if (country.code === "US") return <USDIcon size={size} />;
  if (country.code === "GB") return <GBPIcon size={size} />;
  if (country.code === "DE" || country.code === "FR")
    return <EURIcon size={size} />;
  return (
    <Text style={{ fontSize: size * 0.8, lineHeight: size }}>
      {country.flag}
    </Text>
  );
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  function PhoneInput(
    {
      country,
      onSelectCountry,
      value,
      onChangeText,
      label = "Phone number",
      placeholder = "090 2222 2222",
      error,
      containerClassName,
      style,
      ...props
    },
    ref,
  ) {
    const [modalVisible, setModalVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const localInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => localInputRef.current as TextInput);

    return (
      <View className={cn("w-full", containerClassName)}>
        {Boolean(label) && <InputLabel>{label}</InputLabel>}
        <Pressable
          onPress={() => localInputRef.current?.focus()}
          className={cn(
            "h-16 w-full rounded-2xl border px-4 flex-row items-center",
            error
              ? "border-red-500 bg-red-50/20"
              : isFocused
                ? "border-black bg-white"
                : "border-gray-200 bg-[#F9FAFB]",
          )}
        >
          {/* Dial code & country flag trigger */}
          <Pressable
            onPress={() => setModalVisible(true)}
            hitSlop={6}
            className="flex-row items-center gap-2 py-1 pr-1 active:opacity-70"
          >
            <CountryFlagIcon country={country} size={24} />
            <Text className="font-inter text-lg font-bold text-gray-900">
              {country.dialCode}
            </Text>
            <DownArrowIcon size={12} color="#6B7280" />
          </Pressable>

          {/* Divider */}
          <View className="px-3">
            <View className="w-px h-6 bg-gray-200" />
          </View>

          {/* Phone number text input */}
          <TextInput
            ref={localInputRef}
            className="flex-1 font-inter text-lg text-gray-900 py-0"
            style={[
              {
                paddingVertical: 0,
                textAlignVertical: "center",
                includeFontPadding: false,
              },
              Platform.OS === "ios" ? { lineHeight: undefined } : undefined,
              style,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </Pressable>
        {Boolean(error) && (
          <Text className="font-inter text-xs text-red-500 mt-1.5 ml-1">
            {error}
          </Text>
        )}

        <DraggableBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        >
          {/* Title */}
          <Text className="font-satoshi text-2xl font-bold text-gray-900 mb-5">
            Select Country
          </Text>

          {/* Countries list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-[440px]"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {COUNTRIES.map((item) => {
              const isSelected = item.code === country.code;
              return (
                <Pressable
                  key={item.code}
                  onPress={() => {
                    onSelectCountry(item);
                    setModalVisible(false);
                  }}
                  className={cn(
                    "flex-row items-center justify-between py-3.5 px-3 rounded-2xl active:bg-gray-50 mb-1",
                    isSelected && "bg-gray-50",
                  )}
                >
                  <View className="flex-row items-center gap-3.5 flex-1 mr-2">
                    <CountryFlagIcon country={item} size={28} />
                    <Text className="font-inter text-base font-semibold text-gray-900">
                      {item.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2.5">
                    <Text className="font-inter text-base font-bold text-gray-600">
                      {item.dialCode}
                    </Text>
                    {isSelected && <CheckIcon size={18} />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </DraggableBottomSheet>
      </View>
    );
  },
);
