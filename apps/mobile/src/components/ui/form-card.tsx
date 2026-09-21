import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export interface FormCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard soft card wrapper for form inputs and quick options.
 * Matches design in electricity, airtime, tv, and transfer screens.
 */
export function FormCard({ children, className, ...props }: FormCardProps) {
  return (
    <View
      className={cn("bg-[#F8F8FB] rounded-2xl p-4 mb-6 gap-5", className)}
      {...props}
    >
      {children}
    </View>
  );
}
