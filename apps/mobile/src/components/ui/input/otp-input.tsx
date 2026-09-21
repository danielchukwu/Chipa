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
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeOtp: (otp: string) => void;
  onResend?: () => void;
  initialCountdown?: number;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChangeOtp,
  onResend,
  initialCountdown = 59,
  autoFocus = true,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [countdown, setCountdown] = useState(initialCountdown);

  // Smooth focus after screen navigation transition has completed
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

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(initialCountdown);
    onResend?.();
  };

  const digits = value.split("");

  // Determine which box should show the active border/blinking cursor:
  // Next unfilled slot, or the last slot if all digits are entered
  const activeIndex = digits.length < length ? digits.length : length - 1;

  const handleFocusInput = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  return (
    <View className="w-full">
      {/* Box container: visual boxes underneath, native full-frame TextInput overlaid */}
      <Pressable
        onPress={handleFocusInput}
        className="relative w-full my-6 justify-center"
      >
        {/* Visual Digit Boxes */}
        <View className="flex-row justify-between w-full" pointerEvents="none">
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
                {digit ? (
                  <Text className="font-satoshi text-2xl font-extrabold text-gray-900">
                    {digit}
                  </Text>
                ) : isActive ? (
                  <BlinkingCursor height={22} width={2} color="#111827" />
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
            onChangeOtp(sanitized);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          style={styles.fullOverlayInput}
          caretHidden
        />
      </Pressable>

      {/* Resend Countdown Text */}
      <View className="flex-row items-center mt-2">
        <Text className="font-sans text-sm text-gray-500">
          Didn’t get the code?{" "}
        </Text>
        {countdown > 0 ? (
          <Text className="font-sans text-sm font-bold text-gray-800">
            Resend in {countdown} seconds
          </Text>
        ) : (
          <Pressable onPress={handleResend} hitSlop={8}>
            <Text className="font-sans text-sm font-bold text-brand">
              Resend code
            </Text>
          </Pressable>
        )}
      </View>
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
