import React from "react";
import { Pressable, PressableProps, Text } from "react-native";

import { cn } from "@/lib/utils";

export interface TabButtonProps extends PressableProps {
  title: string;
  active: boolean;
  className?: string;
  textClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  activeTextClassName?: string;
  inactiveTextClassName?: string;
}

export function TabButton({
  title,
  active,
  className,
  textClassName,
  activeClassName = "bg-[#FAD2A4]",
  inactiveClassName = "bg-transparent",
  activeTextClassName = "font-bold text-gray-900",
  inactiveTextClassName = "font-medium text-gray-900",
  ...props
}: TabButtonProps) {
  return (
    <Pressable
      className={cn(
        "rounded-full h-10 items-center justify-center px-4 py-2 active:opacity-80",
        active ? activeClassName : inactiveClassName,
        className,
      )}
      {...props}
    >
      <Text
        className={cn(
          "text-[14px]",
          active ? activeTextClassName : inactiveTextClassName,
          textClassName,
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

// Alias for semantic clarity
export const SegmentButton = TabButton;
