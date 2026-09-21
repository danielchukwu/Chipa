import React from "react";
import { Text, TextProps } from "react-native";

import { cn } from "@/lib/utils";

export interface InputLabelProps extends TextProps {
  children?: React.ReactNode;
  className?: string;
  error?: boolean;
}

export function InputLabel({
  children,
  className,
  error,
  ...props
}: InputLabelProps) {
  if (!children) return null;

  return (
    <Text
      className={cn(
        "font-medium text-gray-700 mb-2.5",
        error && "text-red-500",
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
}
