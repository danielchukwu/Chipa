import React from "react";
import { Pressable, View } from "react-native";

import { CompanyLogo } from "@/components/ui/company-logo";
import { DownArrowIcon } from "@/components/ui/icons/down-arrow-icon";
import { User2Icon } from "@/components/ui/icons/user-2-icon";
import { AppInput } from "@/components/ui/input/app-input";
import { TelcoLogo, TelcoProvider } from "@/components/ui/telco-logo";
import { getTelcoLogoUrl } from "@/constants/company-logos";
import { cn } from "@/lib/utils";

export interface TelcoSelectorPillProps {
  provider: TelcoProvider;
  imageUrl?: string;
  onPress: () => void;
  size?: number;
  className?: string;
}

export function TelcoSelectorPill({
  provider,
  imageUrl,
  onPress,
  size = 32,
  className,
}: TelcoSelectorPillProps) {
  const resolvedImageUrl = imageUrl || getTelcoLogoUrl(provider);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      className={cn(
        "flex-row items-center gap-2 p-1.5 rounded-full active:bg-gray-100",
        className,
      )}
    >
      <CompanyLogo
        imageUrl={resolvedImageUrl}
        fallbackLogo={<TelcoLogo provider={provider} size={size} />}
        name={provider}
        size={size}
      />
      <DownArrowIcon width={14} height={14} color="#6B7280" />
    </Pressable>
  );
}

export interface TelcoPhoneInputBarProps {
  network: TelcoProvider;
  networkImageUrl?: string;
  onPressNetwork: () => void;
  phoneNumber: string;
  onChangePhoneNumber: (text: string) => void;
  placeholder?: string;
  onPressContacts?: () => void;
  className?: string;
  error?: string;
}

export function TelcoPhoneInputBar({
  network,
  networkImageUrl,
  onPressNetwork,
  phoneNumber,
  onChangePhoneNumber,
  placeholder = "Phone number",
  onPressContacts,
  className,
  error,
}: TelcoPhoneInputBarProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between mb-5",
        className,
      )}
    >
      {/* Telco Selector Pill */}
      <TelcoSelectorPill
        provider={network}
        imageUrl={networkImageUrl}
        onPress={onPressNetwork}
      />

      {/* Phone Number Input with Yellow Underline */}
      <AppInput
        variant="underlined"
        value={phoneNumber}
        onChangeText={onChangePhoneNumber}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        containerClassName="flex-1 mx-2"
        error={error}
      />

      {/* Contact Book Button */}
      {onPressContacts && (
        <Pressable
          onPress={onPressContacts}
          hitSlop={8}
          className="active:opacity-75"
        >
          <User2Icon className="text-brand" width={32} />
        </Pressable>
      )}
    </View>
  );
}
