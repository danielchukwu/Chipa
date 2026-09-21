import React from "react";
import { View, ViewProps } from "react-native";

import { cn } from "@/lib/utils";

export interface RadioIndicatorProps extends ViewProps {
  selected: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  selectedColorClass?: string;
  unselectedColorClass?: string;
}

/**
 * Standardized App Radio Indicator
 *
 * Renders a consistent circular radio indicator across the app.
 * - When selected: Uses `bg-brand` with an inner white dot.
 * - When unselected: Uses `bg-black/10` (or custom unselectedColorClass).
 */
export function RadioIndicator({
  selected,
  size = "md",
  className,
  selectedColorClass = "bg-brand",
  unselectedColorClass = "bg-black/10",
  ...props
}: RadioIndicatorProps) {
  const outerSizeClass =
    size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";
  const innerDotClass =
    size === "sm" ? "size-1.5" : size === "lg" ? "size-2.5" : "size-2";

  return (
    <View
      className={cn(
        "rounded-full items-center justify-center",
        outerSizeClass,
        selected ? selectedColorClass : unselectedColorClass,
        className,
      )}
      {...props}
    >
      {selected && (
        <View className={cn("rounded-full bg-white", innerDotClass)} />
      )}
    </View>
  );
}
