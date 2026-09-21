import React from "react";
import { Pressable, Text, View } from "react-native";

import { DownArrowIcon } from "@/components/ui/icons/down-arrow-icon";
import { InputLabel } from "@/components/ui/input-label";
import { cn } from "@/lib/utils";

export interface SelectInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  leadingIcon?: React.ReactNode;
  onPress?: () => void;
  error?: string;
  containerClassName?: string;
  disabled?: boolean;
}

export function SelectInput({
  label,
  placeholder = "Select an option",
  value,
  leadingIcon,
  onPress,
  error,
  containerClassName,
  disabled = false,
}: SelectInputProps) {
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <View className={cn("w-full", containerClassName)}>
      {Boolean(label) && <InputLabel>{label}</InputLabel>}

      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        className={cn(
          "h-16 w-full rounded-2xl border px-4 flex-row items-center justify-between active:bg-gray-100",
          error
            ? "border-red-500 bg-red-50/20"
            : "border-gray-200 bg-[#FBFCFE]",
          disabled && "opacity-60",
        )}
      >
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          {leadingIcon}
          <Text
            numberOfLines={1}
            className={cn(
              "font-inter text-lg",
              hasValue ? "text-gray-900 font-medium" : "text-gray-400",
            )}
          >
            {hasValue ? value : placeholder}
          </Text>
        </View>

        <DownArrowIcon size={14} color="#6B7280" />
      </Pressable>

      {error ? (
        <Text className="font-inter text-xs text-red-500 mt-1.5 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
