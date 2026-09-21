import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";

import { InputLabel } from "@/components/ui/input-label";
import { cn } from "@/lib/utils";

export interface AmountPayInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  currencySymbol?: string;
  onPay?: () => void;
  payButtonText?: string;
  payDisabled?: boolean;
  payButtonClassName?: string;
  containerClassName?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Standardized Amount Input with Currency Symbol and inline Pay Action Button.
 * Conforms to the AppInput design system tokens (h-16, rounded-2xl, focus rings, typography).
 */
export const AmountPayInput = forwardRef<TextInput, AmountPayInputProps>(
  function AmountPayInput(
    {
      label,
      error,
      currencySymbol = "₦",
      onPay,
      payButtonText = "Pay",
      payDisabled = false,
      payButtonClassName,
      containerClassName,
      className,
      style,
      value,
      onChangeText,
      placeholder = "100 - 5,000,000",
      placeholderTextColor = "#9CA3AF",
      keyboardType = "numeric",
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const localInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => localInputRef.current as TextInput);

    return (
      <View className={cn("w-full", containerClassName)}>
        {Boolean(label) && <InputLabel>{label}</InputLabel>}
        <Pressable
          onPress={() => localInputRef.current?.focus()}
          className={cn(
            "h-16 w-full rounded-2xl border px-4 flex-row items-center justify-between",
            error
              ? "border-red-500 bg-red-50/20"
              : isFocused
                ? "border-black bg-white"
                : "border-gray-200 bg-[#F9FAFB]",
            className,
          )}
        >
          {/* Left Currency Symbol + Input */}
          <View className="flex-row items-center flex-1 mr-2">
            {Boolean(currencySymbol) && (
              <Text className="font-satoshi text-xl font-bold text-gray-900 mr-2">
                {currencySymbol}
              </Text>
            )}
            <TextInput
              ref={localInputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              keyboardType={keyboardType}
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
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              {...props}
            />
          </View>

          {/* Right Action Button (e.g. "Pay") */}
          {Boolean(onPay) && (
            <Pressable
              onPress={onPay}
              disabled={payDisabled}
              className={cn(
                "h-10 px-5 rounded-full items-center justify-center bg-black active:opacity-85 shadow-2xs",
                payDisabled && "opacity-50",
                payButtonClassName,
              )}
            >
              <Text className="font-satoshi text-xs font-bold text-[#FDE5C5]">
                {payButtonText}
              </Text>
            </Pressable>
          )}
        </Pressable>

        {Boolean(error) && (
          <Text className="font-sans text-xs text-red-500 mt-1.5 ml-1">
            {error}
          </Text>
        )}
      </View>
    );
  },
);
