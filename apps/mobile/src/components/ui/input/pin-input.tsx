import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BlinkingCursor } from "@/components/ui/blinking-cursor";
import { InputLabel } from "@/components/ui/input-label";
import { cn } from "@/lib/utils";

export interface PinInputProps {
  label?: string;
  length?: number;
  value: string;
  onChangePin: (pin: string) => void;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  error?: string;
}

export function PinInput({
  label,
  length = 4,
  value,
  onChangePin,
  secureTextEntry = false,
  autoFocus = false,
  error,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const digits = value.split("");

  // Automatically focus on mount if autoFocus is true
  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      setIsFocused(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  // Unfocus and blur input whenever the soft keyboard is dismissed
  useEffect(() => {
    const mountedAt = Date.now();
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      // Ignore initial hide events from previous screen transition
      if (Date.now() - mountedAt < 500) return;
      inputRef.current?.blur();
      setIsFocused(false);
    });
    return () => hideSub.remove();
  }, []);

  // Determine which box should show the active border/blinking cursor:
  // Next unfilled slot, or the last slot if all digits are entered
  const activeIndex = digits.length < length ? digits.length : length - 1;

  const handleFocusInput = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  return (
    <View className="w-full mb-6">
      {Boolean(label) && <InputLabel>{label}</InputLabel>}

      {/* Visual PIN digit boxes with full overlay input */}
      <Pressable
        onPress={handleFocusInput}
        className="relative justify-center items-center"
      >
        <View className="flex-row gap-3 justify-center" pointerEvents="none">
          {Array.from({ length }).map((_, index) => {
            const digit = digits[index] ?? "";
            const isActive = isFocused && index === activeIndex;
            const isFilled = digit !== "";

            return (
              <View
                key={index}
                className={cn(
                  "w-14 h-14 rounded-2xl items-center justify-center border",
                  isActive
                    ? "border-2 border-black bg-white"
                    : isFilled
                      ? "border-gray-300 bg-white"
                      : "border-transparent bg-gray-100",
                )}
                style={isActive ? styles.activeShadow : undefined}
              >
                {isFilled ? (
                  secureTextEntry ? (
                    <View className="w-3 h-3 rounded-full bg-gray-900" />
                  ) : (
                    <Text className="font-satoshi text-2xl font-extrabold text-gray-900">
                      {digit}
                    </Text>
                  )
                ) : isActive ? (
                  <BlinkingCursor height={24} width={2} color="#111827" />
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Real Native TextInput spanning the entire box area */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => {
            const sanitized = text.replace(/[^0-9]/g, "").slice(0, length);
            onChangePin(sanitized);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          style={styles.fullOverlayInput}
          caretHidden
        />
      </Pressable>

      {error ? (
        <Text className="font-sans text-xs text-red-500 mt-2">{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  fullOverlayInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
  },
});
