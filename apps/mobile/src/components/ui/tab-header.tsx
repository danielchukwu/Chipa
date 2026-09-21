import React from "react";
import { Text, View } from "react-native";
import { cn } from "@/lib/utils";

export interface TabHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function TabHeader({
  title,
  rightAction,
  className,
  titleClassName,
}: TabHeaderProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between px-5 py-4",
        className,
      )}
    >
      <Text
        className={cn(
          "font-satoshi text-xl font-bold text-gray-900",
          titleClassName,
        )}
      >
        {title}
      </Text>
      {rightAction}
    </View>
  );
}
