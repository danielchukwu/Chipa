import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { InputLabel } from "@/components/ui/input-label";
import { cn } from "@/lib/utils";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  isPassword?: boolean;
  variant?: "default" | "underlined";
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  {
    label,
    error,
    containerClassName,
    inputClassName,
    isPassword = false,
    secureTextEntry,
    variant = "default",
    leftElement,
    rightElement,
    style,
    className,
    ...props
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const localInputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => localInputRef.current as TextInput);

  const effectiveSecure = isPassword ? !showPassword : secureTextEntry;
  const isUnderlined = variant === "underlined";

  return (
    <View className={cn("w-full", containerClassName)}>
      {Boolean(label) && <InputLabel>{label}</InputLabel>}
      <Pressable
        onPress={() => localInputRef.current?.focus()}
        className={
          isUnderlined
            ? cn(
                "h-16 w-full border-b-2 flex-row items-center bg-transparent px-0 pb-1 justify-center",
                error
                  ? "border-red-500"
                  : isFocused
                    ? "border-[#FACC15]"
                    : "border-[#FACC15]",
                className,
              )
            : cn(
                "h-16 w-full rounded-2xl border px-4 flex-row items-center",
                error
                  ? "border-red-500 bg-red-50/20"
                  : isFocused
                    ? "border-black bg-white"
                    : "border-gray-200 bg-[#F9FAFB]",
                className,
              )
        }
      >
        {leftElement}
        <TextInput
          ref={localInputRef}
          className={cn(
            "flex-1 font-inter text-lg text-gray-900 py-0",
            isUnderlined && "font-medium",
            inputClassName,
          )}
          style={[
            {
              paddingVertical: 0,
              textAlignVertical: "center",
              includeFontPadding: false,
            },
            Platform.OS === "ios" ? { lineHeight: undefined } : undefined,
            style,
          ]}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={effectiveSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightElement}
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={8}
            className="p-1 ml-1"
          >
            <Text className="font-sans text-xs font-semibold text-gray-500">
              {showPassword ? "Hide" : "Show"}
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
});
