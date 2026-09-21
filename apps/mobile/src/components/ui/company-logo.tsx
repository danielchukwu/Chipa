import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { ChevronDownIcon } from "@/components/ui/icons/app-icons";
import { cn } from "@/lib/utils";

export interface CompanyLogoProps {
  imageUrl?: string;
  name?: string;
  size?: number;
  fallbackLogo?: React.ReactNode;
  className?: string;
  imageClassName?: string;
}

export function CompanyLogo({
  imageUrl,
  name,
  size = 36,
  fallbackLogo,
  className,
  imageClassName,
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);

  const initials =
    name
      ?.trim()
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "•";

  return (
    <View
      style={{ width: size, height: size }}
      className={cn(
        "rounded-full bg-white border border-gray-100 overflow-hidden items-center justify-center shadow-2xs",
        className,
      )}
    >
      {imageUrl && !hasError ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size * 0.78, height: size * 0.78 }}
          resizeMode="contain"
          onError={() => setHasError(true)}
          className={imageClassName}
        />
      ) : fallbackLogo ? (
        fallbackLogo
      ) : (
        <View className="w-full h-full bg-gray-50 items-center justify-center">
          <Text
            className="font-satoshi font-bold text-gray-600"
            style={{ fontSize: size * 0.32 }}
          >
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}

export interface ProviderSelectTriggerProps {
  name: string;
  imageUrl?: string;
  fallbackLogo?: React.ReactNode;
  onPress: () => void;
  size?: number;
  className?: string;
  chevronColor?: string;
}

export function ProviderSelectTrigger({
  name,
  imageUrl,
  fallbackLogo,
  onPress,
  size = 34,
  className,
  chevronColor = "#6B7280",
}: ProviderSelectTriggerProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "h-16 flex-row items-center justify-between py-2 active:opacity-75",
        className,
      )}
      hitSlop={10}
    >
      <View className="flex-row items-center gap-4">
        <CompanyLogo
          imageUrl={imageUrl}
          fallbackLogo={fallbackLogo}
          name={name}
          size={size}
        />
        <Text className="text-lg font-medium text-gray-900">{name}</Text>
      </View>
      <ChevronDownIcon width={16} height={16} color={chevronColor} />
    </Pressable>
  );
}
