import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "brand"
  | "secondary"
  | "outline"
  | "gray"
  | "grey";

export type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export function AppButton({
  title,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  className,
  textClassName,
  ...props
}: AppButtonProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case "primary":
        // Black pill with gold/orange text from designs
        return "bg-black active:bg-neutral-900";
      case "brand":
        return "bg-brand active:bg-brand-600";
      case "secondary":
        return "bg-white border border-gray-200 active:bg-gray-50 shadow-sm";
      case "outline":
        return "bg-transparent border border-black/10 active:bg-gray-100";
      case "gray":
      case "grey":
        return "bg-gray-100 active:bg-gray-200";
      default:
        return "bg-black";
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return "text-[#FDBE4E]";
      case "brand":
        return "text-white";
      case "secondary":
      case "gray":
      case "grey":
        return "text-gray-900";
      case "outline":
        return "text-black";
      default:
        return "text-white";
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return "h-10 px-4";
      case "md":
        return "h-14 px-5";
      case "lg":
      default:
        return "h-16 px-6";
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "sm":
        return "text-sm font-semibold";
      case "md":
        return "text-base font-bold";
      case "lg":
      default:
        return "text-lg font-bold";
    }
  };

  const isDisabled = disabled || loading;

  const getActivityIndicatorColor = () => {
    if (variant === "primary") return "#FDBE4E";
    if (
      variant === "gray" ||
      variant === "grey" ||
      variant === "secondary" ||
      variant === "outline"
    ) {
      return "#111827";
    }
    return "#FFFFFF";
  };

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        "w-full rounded-full items-center justify-center active:scale-[0.99]",
        getSizeStyle(),
        getContainerStyle(),
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getActivityIndicatorColor()} />
      ) : (
        <Text
          className={cn(getTextSizeStyle(), getTextStyle(), textClassName)}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
