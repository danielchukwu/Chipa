import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BlinkingCursor } from "@/components/ui/blinking-cursor";
import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import {
  CloseIcon,
  KeypadBackspaceIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons/snowflake-icon";

export interface EnterPinDrawerProps {
  visible: boolean;
  onClose: () => void;
  onPinComplete: (pin: string) => void;
}

export function EnterPinDrawer({
  visible,
  onClose,
  onPinComplete,
}: EnterPinDrawerProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!visible) {
      setPin("");
    }
  }, [visible]);

  const handleKeyPress = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    // Auto-submit after entering the 4th digit
    if (nextPin.length === 4) {
      setTimeout(() => {
        onPinComplete(nextPin);
      }, 100);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Header */}
      <View className="relative items-center justify-center py-2 mb-6">
        <Text className="font-satoshi text-xl font-bold text-gray-900">
          Enter PIN
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="absolute right-0 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100"
          accessibilityLabel="Dismiss PIN drawer"
        >
          <CloseIcon width={18} height={18} color="#6B7280" />
        </Pressable>
      </View>

      {/* 4 PIN Digit Boxes */}
      <View className="flex-row justify-center items-center gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, index) => {
          const isFilled = index < pin.length;
          const isActive = index === pin.length;

          return (
            <View
              key={index}
              style={[
                styles.pinBox,
                isFilled && styles.pinBoxFilled,
                isActive && styles.pinBoxActive,
              ]}
            >
              {isFilled ? (
                <View className="w-3.5 h-3.5 rounded-full bg-gray-900" />
              ) : isActive ? (
                <BlinkingCursor height={22} width={2} color="#111827" />
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Forgot PIN / Face ID row */}
      <View className="flex-row items-center justify-between px-4 mb-6">
        <Pressable hitSlop={10} className="active:opacity-70">
          <Text className="font-sans text-sm font-semibold text-[#F05A00]">
            Forgot PIN
          </Text>
        </Pressable>
        <Pressable hitSlop={10} className="active:opacity-70">
          <Text className="font-sans text-sm font-semibold text-[#F05A00]">
            Use Face ID
          </Text>
        </Pressable>
      </View>

      {/* Custom Keypad Header */}
      <View className="flex-row items-center justify-between py-2 border-t border-gray-100 mb-2">
        <View className="flex-row items-center">
          <ShieldCheckIcon width={16} height={16} color="#059669" />
          <Text className="font-sans text-xs font-medium text-emerald-700 ml-1.5">
            Chipa Secure Keypad
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={8} className="active:opacity-70">
          <Text className="font-sans text-xs font-semibold text-gray-400">
            Cancel
          </Text>
        </Pressable>
      </View>

      {/* 3x4 Keypad Grid */}
      <View className="gap-2">
        {/* Row 1: 1, 2, 3 */}
        <View className="flex-row justify-between">
          {["1", "2", "3"].map((digit) => (
            <Pressable
              key={digit}
              onPress={() => handleKeyPress(digit)}
              className="flex-1 h-14 mx-1 rounded-2xl bg-white border border-gray-100 items-center justify-center active:bg-gray-100 shadow-2xs"
            >
              <Text className="font-satoshi text-2xl font-bold text-gray-900">
                {digit}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Row 2: 4, 5, 6 */}
        <View className="flex-row justify-between">
          {["4", "5", "6"].map((digit) => (
            <Pressable
              key={digit}
              onPress={() => handleKeyPress(digit)}
              className="flex-1 h-14 mx-1 rounded-2xl bg-white border border-gray-100 items-center justify-center active:bg-gray-100 shadow-2xs"
            >
              <Text className="font-satoshi text-2xl font-bold text-gray-900">
                {digit}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Row 3: 7, 8, 9 */}
        <View className="flex-row justify-between">
          {["7", "8", "9"].map((digit) => (
            <Pressable
              key={digit}
              onPress={() => handleKeyPress(digit)}
              className="flex-1 h-14 mx-1 rounded-2xl bg-white border border-gray-100 items-center justify-center active:bg-gray-100 shadow-2xs"
            >
              <Text className="font-satoshi text-2xl font-bold text-gray-900">
                {digit}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Row 4: Empty, 0, Backspace */}
        <View className="flex-row justify-between">
          <View className="flex-1 h-14 mx-1" />
          <Pressable
            onPress={() => handleKeyPress("0")}
            className="flex-1 h-14 mx-1 rounded-2xl bg-white border border-gray-100 items-center justify-center active:bg-gray-100 shadow-2xs"
          >
            <Text className="font-satoshi text-2xl font-bold text-gray-900">
              0
            </Text>
          </Pressable>
          <Pressable
            onPress={handleBackspace}
            className="flex-1 h-14 mx-1 rounded-2xl bg-white border border-gray-100 items-center justify-center active:bg-gray-100 shadow-2xs"
            accessibilityLabel="Delete last digit"
          >
            <KeypadBackspaceIcon width={22} height={22} color="#111827" />
          </Pressable>
        </View>
      </View>
    </DraggableBottomSheet>
  );
}

const styles = StyleSheet.create({
  pinBox: {
    width: 56,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  pinBoxFilled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  pinBoxActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
});
