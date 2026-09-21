import React from "react";
import { Pressable, Text, View } from "react-native";

import { AppButton, AppButtonProps } from "@/components/ui/app-button";
import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { TabButton, TabButtonProps } from "@/components/ui/tab-button";
import { cn } from "@/lib/utils";

// ─── 1. ScreenHeader Component ───────────────────────────────────────────────
export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  borderBottom?: boolean;
  className?: string;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  onBack,
  borderBottom = false,
  className,
  rightAction,
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        "relative flex-row items-center justify-center px-5 py-3.5",
        className,
      )}
    >
      {onBack && (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="absolute left-5 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 z-10"
        >
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>
      )}

      <Text className="font-satoshi text-base font-bold text-gray-900">
        {title}
      </Text>

      {rightAction && (
        <View className="absolute right-5 z-10">{rightAction}</View>
      )}
    </View>
  );
}

// ─── 2. RecentsFavouritesTabs Component ──────────────────────────────────────
export interface RecentsFavouritesTabsProps<
  T extends string = "Recents" | "Favourites",
> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs?: readonly T[] | T[];
  className?: string;
}

export function RecentsFavouritesTabs<
  T extends string = "Recents" | "Favourites",
>({
  activeTab,
  onTabChange,
  tabs = ["Recents" as T, "Favourites" as T],
  className,
}: RecentsFavouritesTabsProps<T>) {
  return (
    <View className={cn("flex-row items-center gap-2 mb-4", className)}>
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          title={tab}
          active={activeTab === tab}
          onPress={() => onTabChange(tab)}
        />
      ))}
    </View>
  );
}

// ─── 3. SeeAllButton Component ───────────────────────────────────────────────
export interface SeeAllButtonProps {
  label?: string;
  onPress: () => void;
  className?: string;
}

export function SeeAllButton({
  label = "See all",
  onPress,
  className,
}: SeeAllButtonProps) {
  return (
    <AppButton
      title={label}
      variant="gray"
      size="md"
      onPress={onPress}
      className={cn("mt-2", className)}
      textClassName="font-satoshi text-sm font-bold text-gray-900"
    />
  );
}

// ─── 4. Re-export AppButton ──────────────────────────────────────────────────
export { AppButton, AppButtonProps };

// ─── 5. Re-export RadioIndicator ─────────────────────────────────────────────
export {
  RadioIndicator,
  RadioIndicatorProps,
} from "@/components/ui/radio-indicator";

// ─── 6. Re-export AmountPayInput ─────────────────────────────────────────────
export {
  AmountPayInput,
  AmountPayInputProps,
} from "@/components/ui/input/amount-pay-input";

// ─── 7. Re-export TabButton ──────────────────────────────────────────────────
export { TabButton, TabButtonProps };

// ─── 8. Re-export RecipientRow ────────────────────────────────────────────────
export {
  RecipientRow,
  RecipientRowProps,
} from "@/components/ui/recipient-row";

// ─── 9. Re-export QuickAmountsGrid ───────────────────────────────────────────
export {
  QuickAmountTile,
  QuickAmountTileProps,
  QuickAmountsGrid,
  QuickAmountsGridProps,
} from "@/components/ui/quick-amounts-grid";

// ─── 10. Re-export FormCard ──────────────────────────────────────────────────
export { FormCard, FormCardProps } from "@/components/ui/form-card";

// ─── 11. Re-export CompanyLogo & ProviderSelectTrigger ────────────────────────
export {
  CompanyLogo,
  CompanyLogoProps,
  ProviderSelectTrigger,
  ProviderSelectTriggerProps,
} from "@/components/ui/company-logo";

// ─── 12. Re-export TelcoSelectorPill & TelcoPhoneInputBar ─────────────────────
export {
  TelcoSelectorPill,
  TelcoSelectorPillProps,
  TelcoPhoneInputBar,
  TelcoPhoneInputBarProps,
} from "@/components/ui/telco-phone-input-bar";


