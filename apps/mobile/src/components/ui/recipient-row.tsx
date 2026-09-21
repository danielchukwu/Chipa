import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

export interface RecipientRowProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
  avatarSize?: number;
  fallbackLogo?: React.ReactNode;
  onPress?: () => void;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export function RecipientRow({
  title,
  subtitle,
  imageUrl,
  avatarSize = 42,
  fallbackLogo,
  onPress,
  className,
  titleClassName,
  subtitleClassName,
  rightElement,
  disabled = false,
}: RecipientRowProps) {
  const [imgError, setImgError] = useState(false);

  const initials =
    title
      ?.trim()
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "•";

  const isInteractive = Boolean(onPress) && !disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      className={cn(
        "flex-row items-center py-2",
        isInteractive && "active:opacity-60",
        className,
      )}
    >
      {/* ── Avatar Circle with Company Image ── */}
      <View
        style={{ width: avatarSize, height: avatarSize }}
        className="rounded-full bg-white border border-gray-100 overflow-hidden items-center justify-center shadow-2xs"
      >
        {imageUrl && !imgError ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: avatarSize * 0.78, height: avatarSize * 0.78 }}
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
        ) : fallbackLogo ? (
          fallbackLogo
        ) : (
          <View className="w-full h-full bg-gray-50 items-center justify-center">
            <Text className="font-satoshi text-xs font-bold text-gray-500">
              {initials}
            </Text>
          </View>
        )}
      </View>

      {/* ── Title and Subtitle ── */}
      <View className="ml-3.5 flex-1 mr-2">
        <Text
          numberOfLines={1}
          className={cn("font-medium text-gray-900 text-base", titleClassName)}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          className={cn("text-sm text-gray-400 mt-0.5", subtitleClassName)}
        >
          {subtitle}
        </Text>
      </View>

      {/* ── Optional Right Accessory ── */}
      {rightElement && <View className="ml-2">{rightElement}</View>}
    </Pressable>
  );
}
