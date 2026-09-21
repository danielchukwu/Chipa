import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

export interface RuleCardProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  onPress?: () => void;
}

export function RuleCard({
  title,
  subtitle,
  icon,
  className,
  titleClassName,
  subtitleClassName,
  onPress,
}: RuleCardProps) {
  const content = (
    <>
      {icon}
      <View className="flex-1 justify-center">
        <Text
          className={cn("text-lg font-medium text-gray-900", titleClassName)}
        >
          {title}
        </Text>
        <Text
          className={cn(
            "text-lg text-gray-500 mt-0.5 leading-6",
            subtitleClassName,
          )}
        >
          {subtitle}
        </Text>
      </View>
    </>
  );

  const containerClass = cn(
    "min-h-[84px] flex-row items-center gap-4 bg-[#F8F8FB] rounded-2xl px-4 py-3.5",
    onPress && "active:opacity-70",
    className,
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={containerClass}>
        {content}
      </Pressable>
    );
  }

  return <View className={containerClass}>{content}</View>;
}

// Alias for convenience across different contexts
export const ConditionCard = RuleCard;
